import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

import { EstadoSolicitud } from '../enums/estadoSolicitud';
import { Solicitud } from './solicitudEntity';

describe('Solicitud - máquina de estados', () => {
  describe('transiciones válidas desde PENDIENTE', () => {
    it('permite aceptar una solicitud pendiente', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.PENDIENTE);

      solicitud.aceptar();

      expect(solicitud.estado).toBe(EstadoSolicitud.ACEPTADA);
      expect(solicitud.motivoRechazo).toBeNull();
      expect(solicitud.motivoCancelacion).toBeNull();
    });

    it('permite rechazar una solicitud pendiente y guarda el motivo de rechazo normalizado', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.PENDIENTE);

      solicitud.rechazar('  La publicación ya no está disponible  ');

      expect(solicitud.estado).toBe(EstadoSolicitud.RECHAZADA);
      expect(solicitud.motivoRechazo).toBe(
        'La publicación ya no está disponible',
      );
      expect(solicitud.motivoCancelacion).toBeNull();
    });

    it('guarda null como motivo de rechazo cuando el motivo viene vacío', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.PENDIENTE);

      solicitud.rechazar('   ');

      expect(solicitud.estado).toBe(EstadoSolicitud.RECHAZADA);
      expect(solicitud.motivoRechazo).toBeNull();
    });

    it('permite cancelar una solicitud pendiente y guarda el motivo de cancelación normalizado', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.PENDIENTE);

      solicitud.cancelar('  El solicitante ya no necesita la donación  ');

      expect(solicitud.estado).toBe(EstadoSolicitud.CANCELADA);
      expect(solicitud.motivoCancelacion).toBe(
        'El solicitante ya no necesita la donación',
      );
      expect(solicitud.motivoRechazo).toBeNull();
    });

    it('guarda null como motivo de cancelación cuando el motivo viene vacío', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.PENDIENTE);

      solicitud.cancelar('   ');

      expect(solicitud.estado).toBe(EstadoSolicitud.CANCELADA);
      expect(solicitud.motivoCancelacion).toBeNull();
    });
  });

  describe('transiciones válidas desde ACEPTADA', () => {
    it('permite finalizar una solicitud aceptada', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.ACEPTADA);

      solicitud.finalizar();

      expect(solicitud.estado).toBe(EstadoSolicitud.FINALIZADA);
    });

    it('permite expirar una solicitud aceptada', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.ACEPTADA);

      solicitud.expirar();

      expect(solicitud.estado).toBe(EstadoSolicitud.EXPIRADA);
    });

    it('permite cancelar una solicitud aceptada y guarda el motivo de cancelación normalizado', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.ACEPTADA);

      solicitud.cancelarAceptada('  El creador canceló la entrega  ');

      expect(solicitud.estado).toBe(EstadoSolicitud.CANCELADA);
      expect(solicitud.motivoCancelacion).toBe('El creador canceló la entrega');
      expect(solicitud.motivoRechazo).toBeNull();
    });

    it('guarda null como motivo de cancelación aceptada cuando el motivo viene vacío', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.ACEPTADA);

      solicitud.cancelarAceptada('   ');

      expect(solicitud.estado).toBe(EstadoSolicitud.CANCELADA);
      expect(solicitud.motivoCancelacion).toBeNull();
    });
  });

  describe('transiciones inválidas desde PENDIENTE', () => {
    it('no permite finalizar una solicitud pendiente', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.PENDIENTE);

      expect(() => solicitud.finalizar()).toThrow(BadRequestException);
      expect(() => solicitud.finalizar()).toThrow(
        `No se puede cambiar una solicitud de ${EstadoSolicitud.PENDIENTE} a ${EstadoSolicitud.FINALIZADA}`,
      );
      expect(solicitud.estado).toBe(EstadoSolicitud.PENDIENTE);
    });

    it('no permite expirar una solicitud pendiente', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.PENDIENTE);

      expect(() => solicitud.expirar()).toThrow(BadRequestException);
      expect(() => solicitud.expirar()).toThrow(
        `No se puede cambiar una solicitud de ${EstadoSolicitud.PENDIENTE} a ${EstadoSolicitud.EXPIRADA}`,
      );
      expect(solicitud.estado).toBe(EstadoSolicitud.PENDIENTE);
    });

    it('no permite cancelar como aceptada una solicitud pendiente', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.PENDIENTE);

      expect(() => solicitud.cancelarAceptada()).toThrow(ConflictException);
      expect(() => solicitud.cancelarAceptada()).toThrow(
        'Solo se puede cancelar una solicitud aceptada',
      );
      expect(solicitud.estado).toBe(EstadoSolicitud.PENDIENTE);
    });
  });

  describe('transiciones inválidas desde ACEPTADA', () => {
    it('no permite aceptar nuevamente una solicitud aceptada', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.ACEPTADA);

      expect(() => solicitud.aceptar()).toThrow(BadRequestException);
      expect(() => solicitud.aceptar()).toThrow(
        `No se puede cambiar una solicitud de ${EstadoSolicitud.ACEPTADA} a ${EstadoSolicitud.ACEPTADA}`,
      );
      expect(solicitud.estado).toBe(EstadoSolicitud.ACEPTADA);
    });

    it('no permite rechazar una solicitud aceptada', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.ACEPTADA);

      expect(() => solicitud.rechazar('No corresponde')).toThrow(
        ConflictException,
      );
      expect(() => solicitud.rechazar('No corresponde')).toThrow(
        'Solo se pueden rechazar solicitudes pendientes',
      );
      expect(solicitud.estado).toBe(EstadoSolicitud.ACEPTADA);
      expect(solicitud.motivoRechazo).toBeNull();
    });

    it('no permite cancelar con cancelar() una solicitud aceptada', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.ACEPTADA);

      expect(() => solicitud.cancelar('Cancelación inválida')).toThrow(
        ConflictException,
      );
      expect(() => solicitud.cancelar('Cancelación inválida')).toThrow(
        'Solo se pueden cancelar solicitudes pendientes',
      );
      expect(solicitud.estado).toBe(EstadoSolicitud.ACEPTADA);
      expect(solicitud.motivoCancelacion).toBeNull();
    });
  });

  describe('estados terminales', () => {
    const estadosTerminales = [
      EstadoSolicitud.RECHAZADA,
      EstadoSolicitud.CANCELADA,
      EstadoSolicitud.FINALIZADA,
      EstadoSolicitud.EXPIRADA,
    ];

    it.each(estadosTerminales)(
      'no permite aceptar una solicitud en estado %s',
      (estado) => {
        const solicitud = crearSolicitud(estado);

        expect(() => solicitud.aceptar()).toThrow(BadRequestException);
        expect(solicitud.estado).toBe(estado);
      },
    );

    it.each(estadosTerminales)(
      'no permite finalizar una solicitud en estado %s',
      (estado) => {
        const solicitud = crearSolicitud(estado);

        expect(() => solicitud.finalizar()).toThrow(BadRequestException);
        expect(solicitud.estado).toBe(estado);
      },
    );

    it.each(estadosTerminales)(
      'no permite expirar una solicitud en estado %s',
      (estado) => {
        const solicitud = crearSolicitud(estado);

        expect(() => solicitud.expirar()).toThrow(BadRequestException);
        expect(solicitud.estado).toBe(estado);
      },
    );

    it.each(estadosTerminales)(
      'no permite rechazar una solicitud en estado %s',
      (estado) => {
        const solicitud = crearSolicitud(estado);

        expect(() => solicitud.rechazar('Motivo')).toThrow(ConflictException);
        expect(() => solicitud.rechazar('Motivo')).toThrow(
          'Solo se pueden rechazar solicitudes pendientes',
        );
        expect(solicitud.estado).toBe(estado);
        expect(solicitud.motivoRechazo).toBeNull();
      },
    );

    it.each(estadosTerminales)(
      'no permite cancelar una solicitud en estado %s',
      (estado) => {
        const solicitud = crearSolicitud(estado);

        expect(() => solicitud.cancelar('Motivo')).toThrow(ConflictException);
        expect(() => solicitud.cancelar('Motivo')).toThrow(
          'Solo se pueden cancelar solicitudes pendientes',
        );
        expect(solicitud.estado).toBe(estado);
        expect(solicitud.motivoCancelacion).toBeNull();
      },
    );

    it.each(estadosTerminales)(
      'no permite cancelar como aceptada una solicitud en estado %s',
      (estado) => {
        const solicitud = crearSolicitud(estado);

        expect(() => solicitud.cancelarAceptada('Motivo')).toThrow(
          ConflictException,
        );
        expect(() => solicitud.cancelarAceptada('Motivo')).toThrow(
          'Solo se puede cancelar una solicitud aceptada',
        );
        expect(solicitud.estado).toBe(estado);
        expect(solicitud.motivoCancelacion).toBeNull();
      },
    );
  });

  describe('validaciones de permisos por usuario', () => {
    it('permite la acción cuando el usuario es el creador de la publicación', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.PENDIENTE);

      expect(() =>
        solicitud.validarCreadorPublicacion('usuario-creador'),
      ).not.toThrow();
    });

    it('no permite la acción cuando el usuario no es el creador de la publicación', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.PENDIENTE);

      expect(() => solicitud.validarCreadorPublicacion('otro-usuario')).toThrow(
        ForbiddenException,
      );
      expect(() => solicitud.validarCreadorPublicacion('otro-usuario')).toThrow(
        'Solo el creador de la publicación puede realizar esta acción',
      );
    });

    it('permite la acción cuando el usuario es el solicitante', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.PENDIENTE);

      expect(() =>
        solicitud.validarSolicitante('usuario-solicitante'),
      ).not.toThrow();
    });

    it('no permite la acción cuando el usuario no es el solicitante', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.PENDIENTE);

      expect(() => solicitud.validarSolicitante('otro-usuario')).toThrow(
        ForbiddenException,
      );
      expect(() => solicitud.validarSolicitante('otro-usuario')).toThrow(
        'Solo el solicitante puede realizar esta acción',
      );
    });

    it('usa el mensaje personalizado al validar creador de publicación', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.PENDIENTE);

      expect(() =>
        solicitud.validarCreadorPublicacion(
          'otro-usuario',
          'Mensaje personalizado creador',
        ),
      ).toThrow('Mensaje personalizado creador');
    });

    it('usa el mensaje personalizado al validar solicitante', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.PENDIENTE);

      expect(() =>
        solicitud.validarSolicitante(
          'otro-usuario',
          'Mensaje personalizado solicitante',
        ),
      ).toThrow('Mensaje personalizado solicitante');
    });
  });

  describe('validaciones para cancelación según estado y usuario', () => {
    it('permite que el solicitante cancele una solicitud pendiente', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.PENDIENTE);

      expect(() =>
        solicitud.validarPuedeCancelarsePor('usuario-solicitante'),
      ).not.toThrow();
    });

    it('no permite que el creador cancele una solicitud pendiente', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.PENDIENTE);

      expect(() =>
        solicitud.validarPuedeCancelarsePor('usuario-creador'),
      ).toThrow(ForbiddenException);
      expect(() =>
        solicitud.validarPuedeCancelarsePor('usuario-creador'),
      ).toThrow('Solo el solicitante puede cancelar una solicitud pendiente');
    });

    it('no permite que un tercero cancele una solicitud pendiente', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.PENDIENTE);

      expect(() => solicitud.validarPuedeCancelarsePor('otro-usuario')).toThrow(
        ForbiddenException,
      );
      expect(() => solicitud.validarPuedeCancelarsePor('otro-usuario')).toThrow(
        'Solo el solicitante puede cancelar una solicitud pendiente',
      );
    });

    it('permite que el creador cancele una solicitud aceptada', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.ACEPTADA);

      expect(() =>
        solicitud.validarPuedeCancelarsePor('usuario-creador'),
      ).not.toThrow();
    });

    it('no permite que el solicitante cancele una solicitud aceptada', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.ACEPTADA);

      expect(() =>
        solicitud.validarPuedeCancelarsePor('usuario-solicitante'),
      ).toThrow(ForbiddenException);
      expect(() =>
        solicitud.validarPuedeCancelarsePor('usuario-solicitante'),
      ).toThrow('Solo el creador puede cancelar una solicitud aceptada');
    });

    it('no permite que un tercero cancele una solicitud aceptada', () => {
      const solicitud = crearSolicitud(EstadoSolicitud.ACEPTADA);

      expect(() => solicitud.validarPuedeCancelarsePor('otro-usuario')).toThrow(
        ForbiddenException,
      );
      expect(() => solicitud.validarPuedeCancelarsePor('otro-usuario')).toThrow(
        'Solo el creador puede cancelar una solicitud aceptada',
      );
    });

    it.each([
      EstadoSolicitud.RECHAZADA,
      EstadoSolicitud.CANCELADA,
      EstadoSolicitud.FINALIZADA,
      EstadoSolicitud.EXPIRADA,
    ])('no permite cancelar una solicitud en estado terminal %s', (estado) => {
      const solicitud = crearSolicitud(estado);

      expect(() =>
        solicitud.validarPuedeCancelarsePor('usuario-solicitante'),
      ).toThrow(ConflictException);
      expect(() =>
        solicitud.validarPuedeCancelarsePor('usuario-solicitante'),
      ).toThrow('Solo se pueden cancelar solicitudes pendientes o aceptadas');
    });
  });

  function crearSolicitud(estado: EstadoSolicitud): Solicitud {
    return Object.assign(new Solicitud(), {
      id: 'solicitud-1',
      publicacionId: 'publicacion-1',
      solicitanteId: 'usuario-solicitante',
      creadorPublicacionId: 'usuario-creador',
      mensaje: null,
      estado,
      motivoRechazo: null,
      motivoCancelacion: null,
      version: 1,
      createdAt: new Date('2026-06-24T09:00:00.000Z'),
      updatedAt: new Date('2026-06-24T09:00:00.000Z'),
    });
  }
});
