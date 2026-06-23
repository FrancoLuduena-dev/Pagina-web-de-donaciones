import { validate } from 'class-validator';

import { MotivoDenuncia } from '../enums/motivoDenuncia';
import { TipoResolucion } from '../enums/tipoResolucion';
import { CrearDenunciaDto } from './crearDenunciaDto';
import { ResolverDenunciaDto } from './resolverDenunciaDto';

describe('DTOs de denuncia', () => {
  it('rechaza un comentario formado únicamente por espacios', async () => {
    const dto = Object.assign(new CrearDenunciaDto(), {
      publicacionId: '11111111-1111-4111-8111-111111111111',
      motivo: MotivoDenuncia.CONTENIDO_INAPROPIADO,
      comentario: '          ',
    });

    const errores = await validate(dto);

    expect(errores.some((error) => error.property === 'comentario')).toBe(true);
  });

  it('rechaza un detalle de resolución formado únicamente por espacios', async () => {
    const dto = Object.assign(new ResolverDenunciaDto(), {
      version: 1,
      tipoResolucion: TipoResolucion.DESCARTADA,
      detalleResolucion: '               ',
    });

    const errores = await validate(dto);

    expect(
      errores.some((error) => error.property === 'detalleResolucion'),
    ).toBe(true);
  });
});
