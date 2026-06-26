import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { open, unlink } from 'fs/promises';
import { join } from 'path';
import { diskStorage } from 'multer';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'publicaciones');
export const MAX_IMAGENES_PUBLICACION = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MIME_TYPE_EXTENSIONS: Readonly<Record<string, string>> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};

if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const publicacionUploadMulterOptions = {
  storage: diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
      const extension = MIME_TYPE_EXTENSIONS[file.mimetype];

      if (!extension) {
        cb(new BadRequestException('Tipo de imagen no permitido'), '');
        return;
      }

      cb(null, `${randomUUID()}${extension}`);
    },
  }),
  fileFilter: (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!MIME_TYPE_EXTENSIONS[file.mimetype]) {
      cb(
        new BadRequestException(
          'Solo se permiten imágenes JPG, PNG, GIF o WEBP',
        ),
        false,
      );
      return;
    }

    cb(null, true);
  },
  limits: { fileSize: MAX_FILE_SIZE },
};

export async function validarImagenesSubidas(
  files: Express.Multer.File[],
): Promise<void> {
  try {
    await Promise.all(files.map((file) => validarFirmaImagen(file)));
  } catch {
    await Promise.all(
      files.map((file) => unlink(file.path).catch(() => undefined)),
    );

    throw new BadRequestException(
      'Uno o más archivos no contienen una imagen válida',
    );
  }
}

async function validarFirmaImagen(file: Express.Multer.File): Promise<void> {
  const fileHandle = await open(file.path, 'r');

  try {
    const encabezado = Buffer.alloc(12);
    const { bytesRead } = await fileHandle.read(encabezado, 0, 12, 0);

    if (
      !firmaCoincideConMimeType(
        encabezado.subarray(0, bytesRead),
        file.mimetype,
      )
    ) {
      throw new Error('La firma del archivo no coincide con su tipo MIME');
    }
  } finally {
    await fileHandle.close();
  }
}

function firmaCoincideConMimeType(
  encabezado: Buffer,
  mimeType: string,
): boolean {
  switch (mimeType) {
    case 'image/jpeg':
      return (
        encabezado.length >= 3 &&
        encabezado[0] === 0xff &&
        encabezado[1] === 0xd8 &&
        encabezado[2] === 0xff
      );

    case 'image/png':
      return (
        encabezado.length >= 8 &&
        encabezado
          .subarray(0, 8)
          .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
      );

    case 'image/gif': {
      const firma = encabezado.subarray(0, 6).toString('ascii');
      return firma === 'GIF87a' || firma === 'GIF89a';
    }

    case 'image/webp':
      return (
        encabezado.length >= 12 &&
        encabezado.subarray(0, 4).toString('ascii') === 'RIFF' &&
        encabezado.subarray(8, 12).toString('ascii') === 'WEBP'
      );

    default:
      return false;
  }
}

export function buildPublicacionImagenUrl(filename: string): string {
  const baseUrl =
    process.env.API_PUBLIC_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
  return `${baseUrl}/uploads/publicaciones/${filename}`;
}
