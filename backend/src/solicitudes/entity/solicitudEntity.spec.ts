import { EstadoSolicitud } from '../enums/estadoSolicitud';
import { Solicitud } from './solicitudEntity';

describe('Solicitud - estados de rechazo y cancelación', () => {
  it('rechaza una solicitud pendiente y guarda el motivo de rechazo', () => {
    const solicitud = crearSolicitud(EstadoSolicitud.PENDIENTE);

    solicitud.rechazar('La publicación ya no está disponible');

    expect(solicitud.estado).toBe(EstadoSolicitud.RECHAZADA);
    expect(solicitud.motivoRechazo).toBe(
      'La publicación ya no está disponible',
    );
    expect(solicitud.motivoCancelacion).toBeUndefined();
  });

  it('cancela una solicitud aceptada y guarda el motivo de cancelación', () => {
    const solicitud = crearSolicitud(EstadoSolicitud.ACEPTADA);

    solicitud.cancelarAceptada('El creador canceló la entrega');

    expect(solicitud.estado).toBe(EstadoSolicitud.CANCELADA);
    expect(solicitud.motivoCancelacion).toBe('El creador canceló la entrega');
    expect(solicitud.motivoRechazo).toBeUndefined();
  });

  it('no permite cancelar como aceptada una solicitud pendiente', () => {
    const solicitud = crearSolicitud(EstadoSolicitud.PENDIENTE);

    expect(() => solicitud.cancelarAceptada()).toThrow(
      'Solo se puede cancelar una solicitud aceptada',
    );
  });

  function crearSolicitud(estado: EstadoSolicitud): Solicitud {
    return Object.assign(new Solicitud(), {
      estado,
      motivoRechazo: undefined,
      motivoCancelacion: undefined,
    });
  }
});
