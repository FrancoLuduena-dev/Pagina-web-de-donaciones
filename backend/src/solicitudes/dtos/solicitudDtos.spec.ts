import { validate } from 'class-validator';

import { CancelarSolicitudDto } from './cancelarSolicitudDto';
import { CrearSolicitudDto } from './crearSolicitudDto';
import { RechazarSolicitudDto } from './rechazarSolicitudDto';

describe('DTOs de solicitud', () => {
  const publicacionIdValido = '11111111-1111-4111-8111-111111111111';

  describe('CrearSolicitudDto', () => {
    it('permite omitir el mensaje', async () => {
      const dto = Object.assign(new CrearSolicitudDto(), {
        publicacionId: publicacionIdValido,
      });

      await expect(validate(dto)).resolves.toHaveLength(0);
    });

    it('permite un mensaje válido', async () => {
      const dto = Object.assign(new CrearSolicitudDto(), {
        publicacionId: publicacionIdValido,
        mensaje: 'Me interesa coordinar la entrega de la publicación.',
      });

      await expect(validate(dto)).resolves.toHaveLength(0);
    });

    it.each(['', '   '])(
      'rechaza el mensaje vacío o sin contenido: %j',
      async (mensaje) => {
        const dto = Object.assign(new CrearSolicitudDto(), {
          publicacionId: publicacionIdValido,
          mensaje,
        });

        const errores = await validate(dto);

        expect(errores.some((error) => error.property === 'mensaje')).toBe(
          true,
        );
      },
    );

    it('rechaza mensajes de más de 255 caracteres', async () => {
      const dto = Object.assign(new CrearSolicitudDto(), {
        publicacionId: publicacionIdValido,
        mensaje: 'a'.repeat(256),
      });

      const errores = await validate(dto);

      expect(errores.some((error) => error.property === 'mensaje')).toBe(true);
    });

    it('rechaza un identificador de publicación inválido', async () => {
      const dto = Object.assign(new CrearSolicitudDto(), {
        publicacionId: 'id-invalido',
      });

      const errores = await validate(dto);

      expect(errores.some((error) => error.property === 'publicacionId')).toBe(
        true,
      );
    });
  });

  describe('RechazarSolicitudDto', () => {
    it('permite omitir el motivo', async () => {
      const dto = new RechazarSolicitudDto();

      await expect(validate(dto)).resolves.toHaveLength(0);
    });

    it('permite un motivo válido', async () => {
      const dto = Object.assign(new RechazarSolicitudDto(), {
        motivo: 'La publicación ya no se encuentra disponible.',
      });

      await expect(validate(dto)).resolves.toHaveLength(0);
    });

    it.each(['', '   '])(
      'rechaza el motivo vacío o sin contenido: %j',
      async (motivo) => {
        const dto = Object.assign(new RechazarSolicitudDto(), { motivo });

        const errores = await validate(dto);

        expect(errores.some((error) => error.property === 'motivo')).toBe(true);
      },
    );

    it('rechaza motivos de más de 255 caracteres', async () => {
      const dto = Object.assign(new RechazarSolicitudDto(), {
        motivo: 'a'.repeat(256),
      });

      const errores = await validate(dto);

      expect(errores.some((error) => error.property === 'motivo')).toBe(true);
    });
  });

  describe('CancelarSolicitudDto', () => {
    it('permite omitir el motivo', async () => {
      const dto = new CancelarSolicitudDto();

      await expect(validate(dto)).resolves.toHaveLength(0);
    });

    it('permite un motivo válido', async () => {
      const dto = Object.assign(new CancelarSolicitudDto(), {
        motivo: 'No puedo continuar con la coordinación de la entrega.',
      });

      await expect(validate(dto)).resolves.toHaveLength(0);
    });

    it.each(['', '   '])(
      'rechaza el motivo vacío o sin contenido: %j',
      async (motivo) => {
        const dto = Object.assign(new CancelarSolicitudDto(), { motivo });

        const errores = await validate(dto);

        expect(errores.some((error) => error.property === 'motivo')).toBe(true);
      },
    );

    it('rechaza motivos de más de 255 caracteres', async () => {
      const dto = Object.assign(new CancelarSolicitudDto(), {
        motivo: 'a'.repeat(256),
      });

      const errores = await validate(dto);

      expect(errores.some((error) => error.property === 'motivo')).toBe(true);
    });
  });
});
