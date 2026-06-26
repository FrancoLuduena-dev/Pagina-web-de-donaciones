import { BadRequestException } from '@nestjs/common';
import { existsSync } from 'fs';
import { mkdir, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { Readable } from 'stream';

import {
  buildPublicacionImagenUrl,
  MAX_IMAGENES_PUBLICACION,
  publicacionUploadMulterOptions,
  validarImagenesSubidas,
} from './publicacionUploadService';

type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;
type FilenameCallback = (error: Error | null, filename: string) => void;

type StorageConGetFilename = {
  getFilename: (
    req: object,
    file: Express.Multer.File,
    callback: FilenameCallback,
  ) => void;
};

describe('publicacionUploadService', () => {
  const uploadDir = join(process.cwd(), 'uploads', 'publicaciones');
  const archivosTemporales: string[] = [];
  const apiPublicUrlOriginal = process.env.API_PUBLIC_URL;

  afterEach(async () => {
    process.env.API_PUBLIC_URL = apiPublicUrlOriginal;

    await Promise.all(
      archivosTemporales.map((archivoPath) => rm(archivoPath, { force: true })),
    );

    archivosTemporales.length = 0;
    jest.restoreAllMocks();
  });

  describe('configuración multer', () => {
    it('define el máximo de imágenes permitidas por publicación', () => {
      expect(MAX_IMAGENES_PUBLICACION).toBe(5);
    });

    it('configura límite de tamaño de archivo en 5MB', () => {
      expect(publicacionUploadMulterOptions.limits).toEqual({
        fileSize: 5 * 1024 * 1024,
      });
    });

    it.each([
      ['image/jpeg', true],
      ['image/png', true],
      ['image/gif', true],
      ['image/webp', true],
      ['application/pdf', false],
      ['text/plain', false],
    ])(
      'fileFilter valida mimetype %s con resultado %s',
      (mimetype, esperado) => {
        const file = crearArchivoMulterEnMemoria({
          filename: 'archivo',
          mimetype,
          buffer: Buffer.from('contenido'),
        });
        const callback = jest.fn<void, Parameters<FileFilterCallback>>();

        publicacionUploadMulterOptions.fileFilter({}, file, callback);

        expect(callback).toHaveBeenCalledTimes(1);

        const [error, acceptFile] = callback.mock.calls[0];

        expect(acceptFile).toBe(esperado);

        if (esperado) {
          expect(error).toBeNull();
        } else {
          expect(error).toBeInstanceOf(BadRequestException);
          expect(error?.message).toBe(
            'Solo se permiten imágenes JPG, PNG, GIF o WEBP',
          );
        }
      },
    );

    it.each([
      ['image/jpeg', '.jpg'],
      ['image/png', '.png'],
      ['image/gif', '.gif'],
      ['image/webp', '.webp'],
    ])(
      'genera filename con extensión correcta para %s',
      (mimetype, extension) => {
        const storage = publicacionUploadMulterOptions.storage;

        if (!tieneGetFilename(storage)) {
          throw new Error('El storage de multer no expone getFilename');
        }

        const file = crearArchivoMulterEnMemoria({
          filename: `archivo${extension}`,
          mimetype,
          buffer: Buffer.from('contenido'),
        });
        const callback = jest.fn<void, Parameters<FilenameCallback>>();

        storage.getFilename({}, file, callback);

        expect(callback).toHaveBeenCalledTimes(1);

        const [error, filename] = callback.mock.calls[0];

        expect(error).toBeNull();
        expect(filename.endsWith(extension)).toBe(true);
        expect(filename).toHaveLength(36 + extension.length);
      },
    );

    it('rechaza filename cuando el mimetype no está permitido', () => {
      const storage = publicacionUploadMulterOptions.storage;

      if (!tieneGetFilename(storage)) {
        throw new Error('El storage de multer no expone getFilename');
      }

      const file = crearArchivoMulterEnMemoria({
        filename: 'archivo.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('contenido'),
      });
      const callback = jest.fn<void, Parameters<FilenameCallback>>();

      storage.getFilename({}, file, callback);

      expect(callback).toHaveBeenCalledTimes(1);

      const [error, filename] = callback.mock.calls[0];

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error?.message).toBe('Tipo de imagen no permitido');
      expect(filename).toBe('');
    });
  });

  describe('validarImagenesSubidas', () => {
    it.each([
      {
        nombre: 'jpeg válido',
        filename: 'imagen.jpg',
        mimetype: 'image/jpeg',
        firma: Buffer.from([0xff, 0xd8, 0xff, 0x00]),
      },
      {
        nombre: 'png válido',
        filename: 'imagen.png',
        mimetype: 'image/png',
        firma: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      },
      {
        nombre: 'gif87a válido',
        filename: 'imagen.gif',
        mimetype: 'image/gif',
        firma: Buffer.from('GIF87a', 'ascii'),
      },
      {
        nombre: 'gif89a válido',
        filename: 'imagen.gif',
        mimetype: 'image/gif',
        firma: Buffer.from('GIF89a', 'ascii'),
      },
      {
        nombre: 'webp válido',
        filename: 'imagen.webp',
        mimetype: 'image/webp',
        firma: Buffer.from([
          0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42,
          0x50,
        ]),
      },
    ])(
      'acepta $nombre cuando la firma coincide con el mimetype',
      async ({ filename, mimetype, firma }) => {
        const file = await crearArchivoMulterTemporal({
          filename,
          mimetype,
          buffer: Buffer.concat([firma, Buffer.from('contenido-extra')]),
        });

        await expect(validarImagenesSubidas([file])).resolves.toBeUndefined();

        expect(existsSync(file.path)).toBe(true);
      },
    );

    it('acepta múltiples imágenes válidas', async () => {
      const png = await crearArchivoMulterTemporal({
        filename: 'imagen-1.png',
        mimetype: 'image/png',
        buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      });
      const jpeg = await crearArchivoMulterTemporal({
        filename: 'imagen-2.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from([0xff, 0xd8, 0xff, 0x00]),
      });

      await expect(
        validarImagenesSubidas([png, jpeg]),
      ).resolves.toBeUndefined();

      expect(existsSync(png.path)).toBe(true);
      expect(existsSync(jpeg.path)).toBe(true);
    });

    it.each([
      {
        nombre: 'jpeg con firma png',
        filename: 'imagen.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      },
      {
        nombre: 'png con firma inválida',
        filename: 'imagen.png',
        mimetype: 'image/png',
        buffer: Buffer.from('no-es-png'),
      },
      {
        nombre: 'gif inválido',
        filename: 'imagen.gif',
        mimetype: 'image/gif',
        buffer: Buffer.from('GIF00a', 'ascii'),
      },
      {
        nombre: 'webp inválido',
        filename: 'imagen.webp',
        mimetype: 'image/webp',
        buffer: Buffer.from('RIFFxxxxNOPE', 'ascii'),
      },
    ])(
      'rechaza $nombre y elimina el archivo subido',
      async ({ filename, mimetype, buffer }) => {
        const file = await crearArchivoMulterTemporal({
          filename,
          mimetype,
          buffer,
        });

        try {
          await validarImagenesSubidas([file]);
          throw new Error('La validación debería haber fallado');
        } catch (error: unknown) {
          expect(error).toBeInstanceOf(BadRequestException);

          if (error instanceof BadRequestException) {
            expect(error.message).toBe(
              'Uno o más archivos no contienen una imagen válida',
            );
          }
        }

        expect(existsSync(file.path)).toBe(false);
      },
    );

    it('si una imagen es inválida elimina todos los archivos del lote', async () => {
      const imagenValida = await crearArchivoMulterTemporal({
        filename: 'valida.png',
        mimetype: 'image/png',
        buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      });
      const imagenInvalida = await crearArchivoMulterTemporal({
        filename: 'invalida.png',
        mimetype: 'image/png',
        buffer: Buffer.from('archivo-falso'),
      });

      await expect(
        validarImagenesSubidas([imagenValida, imagenInvalida]),
      ).rejects.toThrow('Uno o más archivos no contienen una imagen válida');

      expect(existsSync(imagenValida.path)).toBe(false);
      expect(existsSync(imagenInvalida.path)).toBe(false);
    });

    it('rechaza cuando el archivo no existe y no rompe el cleanup', async () => {
      const file = crearArchivoMulterEnMemoria({
        filename: 'inexistente.png',
        mimetype: 'image/png',
        buffer: Buffer.from('contenido'),
      });

      file.path = join(uploadDir, 'archivo-inexistente.png');

      await expect(validarImagenesSubidas([file])).rejects.toThrow(
        'Uno o más archivos no contienen una imagen válida',
      );
    });

    it('rechaza un mimetype no soportado aunque el contenido parezca válido', async () => {
      const file = await crearArchivoMulterTemporal({
        filename: 'imagen.bmp',
        mimetype: 'image/bmp',
        buffer: Buffer.from([0x42, 0x4d, 0x00, 0x00]),
      });

      await expect(validarImagenesSubidas([file])).rejects.toThrow(
        'Uno o más archivos no contienen una imagen válida',
      );

      expect(existsSync(file.path)).toBe(false);
    });
  });

  describe('buildPublicacionImagenUrl', () => {
    it('construye url usando localhost por defecto', () => {
      delete process.env.API_PUBLIC_URL;

      expect(buildPublicacionImagenUrl('imagen.png')).toBe(
        'http://localhost:3000/uploads/publicaciones/imagen.png',
      );
    });

    it('construye url usando API_PUBLIC_URL', () => {
      process.env.API_PUBLIC_URL = 'https://api.donaciones.com';

      expect(buildPublicacionImagenUrl('imagen.png')).toBe(
        'https://api.donaciones.com/uploads/publicaciones/imagen.png',
      );
    });

    it('evita doble slash si API_PUBLIC_URL termina con barra', () => {
      process.env.API_PUBLIC_URL = 'https://api.donaciones.com/';

      expect(buildPublicacionImagenUrl('imagen.png')).toBe(
        'https://api.donaciones.com/uploads/publicaciones/imagen.png',
      );
    });
  });

  async function crearArchivoMulterTemporal(datos: {
    filename: string;
    mimetype: string;
    buffer: Buffer;
  }): Promise<Express.Multer.File> {
    await mkdir(uploadDir, { recursive: true });

    const path = join(
      uploadDir,
      `${Date.now()}-${Math.random().toString(16).slice(2)}-${datos.filename}`,
    );

    await writeFile(path, datos.buffer);
    archivosTemporales.push(path);

    return {
      ...crearArchivoMulterEnMemoria(datos),
      destination: uploadDir,
      path,
    };
  }

  function crearArchivoMulterEnMemoria(datos: {
    filename: string;
    mimetype: string;
    buffer: Buffer;
  }): Express.Multer.File {
    return {
      fieldname: 'imagenes',
      originalname: datos.filename,
      encoding: '7bit',
      mimetype: datos.mimetype,
      size: datos.buffer.length,
      destination: uploadDir,
      filename: datos.filename,
      path: join(uploadDir, datos.filename),
      buffer: datos.buffer,
      stream: Readable.from([]),
    };
  }

  function tieneGetFilename(
    storage: unknown,
  ): storage is StorageConGetFilename {
    if (typeof storage !== 'object' || storage === null) {
      return false;
    }

    const storageRecord: Record<string, unknown> = storage as Record<
      string,
      unknown
    >;

    return typeof storageRecord.getFilename === 'function';
  }
});
