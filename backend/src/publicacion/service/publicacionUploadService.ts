import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { diskStorage } from 'multer';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'publicaciones');
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = /^image\/(jpeg|png|gif|webp)$/;

if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const publicacionUploadMulterOptions = {
  storage: diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!ALLOWED_MIME_TYPES.test(file.mimetype)) {
      cb(new BadRequestException('Solo se permiten imágenes JPG, PNG, GIF o WEBP'), false);
      return;
    }
    cb(null, true);
  },
  limits: { fileSize: MAX_FILE_SIZE },
};

export function buildPublicacionImagenUrl(filename: string): string {
  const baseUrl =
    process.env.API_PUBLIC_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
  return `${baseUrl}/uploads/publicaciones/${filename}`;
}
