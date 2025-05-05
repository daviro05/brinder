export class EquipoModel {

  constructor(
    public personaje_id: string,
    public asignado: boolean,
    public activo: boolean,
    public equipo: string,
    public mision: string,
    public escudo: number,
    public vida: number,
  ) { }

}
