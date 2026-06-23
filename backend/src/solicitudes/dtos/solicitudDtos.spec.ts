import { validate } from 'class-validator';

import { CancelarSolicitudDto } from './cancelarSolicitudDto';
import { CrearSolicitudDto } from './crearSolicitudDto';
import { RechazarSolicitudDto } from './rechazarSolicitudDto';

describe('DTOs de solicitud', () => {
  it('rechaza un mensaje formado únicamente por espacios', async () => {
    const dto = Object.assign(new CrearSolicitudDto(), {
      publicacionId: '11111111-1111-4111-8111-111111111111',
      mensaje: '   ',
    });

    const errores = await validate(dto);

    expect(errores.some((error) => error.property === 'mensaje')).toBe(true);
  });

  it('permite motivo vacío en la cancelación para mantener el flujo actual', async () => {
    const dto = Object.assign(new CancelarSolicitudDto(), {
      motivo: '',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rechaza un motivo de rechazo formado únicamente por espacios', async () => {
    const dto = Object.assign(new RechazarSolicitudDto(), {
      motivo: '   ',
    });

    const errores = await validate(dto);

    expect(errores.some((error) => error.property === 'motivo')).toBe(true);
  });
});
