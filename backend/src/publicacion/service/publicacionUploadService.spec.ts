import { BadRequestException } from '@nestjs/common';
import { access, mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { Readable } from 'stream';

import { validarImagenesSubidas } from './publicacionUploadService';

describe('validarImagenesSubidas', () => {
  let directorioTemporal: string;

  beforeEach(async () => {
    directorioTemporal = await mkdtemp(join(tmpdir(), 'publicacion-upload-'));
  });

  afterEach(async () => {
    await rm(directorioTemporal, { recursive: true, force: true });
  });

  it('acepta un archivo cuya firma coincide con el tipo MIME', async () => {
    const contenidoPng = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
    ]);
    const archivo = await crearArchivo('imagen.png', 'image/png', contenidoPng);

    await expect(validarImagenesSubidas([archivo])).resolves.toBeUndefined();
    await expect(access(archivo.path)).resolves.toBeUndefined();
  });

  it('rechaza un archivo falsificado y elimina todos los archivos del lote', async () => {
    const contenidoPng = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
    ]);
    const imagenValida = await crearArchivo(
      'imagen-valida.png',
      'image/png',
      contenidoPng,
    );
    const imagenFalsa = await crearArchivo(
      'imagen-falsa.jpg',
      'image/jpeg',
      Buffer.from('<html><script>alert(1)</script></html>'),
    );

    await expect(
      validarImagenesSubidas([imagenValida, imagenFalsa]),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(access(imagenValida.path)).rejects.toBeDefined();
    await expect(access(imagenFalsa.path)).rejects.toBeDefined();
  });

  async function crearArchivo(
    nombre: string,
    mimetype: string,
    contenido: Buffer,
  ): Promise<Express.Multer.File> {
    const path = join(directorioTemporal, nombre);
    await writeFile(path, contenido);

    return {
      fieldname: 'imagenes',
      originalname: nombre,
      encoding: '7bit',
      mimetype,
      size: contenido.length,
      destination: directorioTemporal,
      filename: nombre,
      path,
      buffer: Buffer.alloc(0),
      stream: Readable.from(contenido),
    };
  }
});
