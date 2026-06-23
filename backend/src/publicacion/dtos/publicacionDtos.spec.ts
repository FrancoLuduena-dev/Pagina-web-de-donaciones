import { validate } from 'class-validator';

import { CondicionObjeto } from '../enums/condicionObjeto';
import { CrearPublicacionDto } from './crearPublicacionDto';
import { EditarPublicacionDto } from './editarPublicacionDto';

describe('DTOs de publicación', () => {
  it('rechaza un título formado únicamente por espacios', async () => {
    const dto = crearDtoValido();
    dto.titulo = '    ';

    const errores = await validate(dto);

    expect(errores.some((error) => error.property === 'titulo')).toBe(true);
  });

  it('rechaza títulos que superan los 100 caracteres de la entidad', async () => {
    const dto = crearDtoValido();
    dto.titulo = 'a'.repeat(101);

    const errores = await validate(dto);

    expect(errores.some((error) => error.property === 'titulo')).toBe(true);
  });

  it('rechaza espacios y títulos demasiado largos durante la edición', async () => {
    const dto = Object.assign(new EditarPublicacionDto(), {
      titulo: 'a'.repeat(101),
      descripcion: '          ',
    });

    const errores = await validate(dto);

    expect(errores.some((error) => error.property === 'titulo')).toBe(true);
    expect(errores.some((error) => error.property === 'descripcion')).toBe(
      true,
    );
  });

  function crearDtoValido(): CrearPublicacionDto {
    return Object.assign(new CrearPublicacionDto(), {
      titulo: 'Mesa de comedor',
      descripcion: 'Mesa de comedor de madera en muy buen estado.',
      categoriaId: '11111111-1111-4111-8111-111111111111',
      localidadId: '22222222-2222-4222-8222-222222222222',
      condicion: CondicionObjeto.USADO_BUENO,
      imagenUrls: ['http://localhost:3000/uploads/publicaciones/imagen.jpg'],
    });
  }
});
