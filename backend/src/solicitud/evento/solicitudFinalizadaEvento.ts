export class SolicitudFinalizadaEvento {
  constructor(
    public readonly solicitudId: string,
    public readonly destinatarioId: string,
    public readonly publicacionTitulo: string,
  ) {}
}
