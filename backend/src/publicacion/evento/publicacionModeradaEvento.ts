export class PublicacionModeradaEvento {
  constructor(
    public readonly publicacionId: string,
    public readonly destinatarioId: string,
    public readonly publicacionTitulo: string,
  ) {}
}
