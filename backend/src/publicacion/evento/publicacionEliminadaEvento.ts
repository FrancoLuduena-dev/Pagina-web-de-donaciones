export class PublicacionEliminadaEvento {
  constructor(
    public readonly publicacionId: string,
    public readonly publicacionTitulo: string,
    public readonly eliminadaPorModeracion: boolean,
  ) {}
}
