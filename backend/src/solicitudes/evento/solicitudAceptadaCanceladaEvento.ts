export class SolicitudAceptadaCanceladaEvento {
  constructor(
    public readonly solicitudId: string,
    public readonly destinatarioId: string,
    public readonly publicacionTitulo: string,
    public readonly motivo?: string,
  ) {}
}
