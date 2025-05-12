export class EquipoModel {

  constructor(
    public personaje_id: string,
    public asignado: boolean,
    public activo: boolean,
    public equipo: string,
    public mision: string,
    public escudo: number,
    public valor: number,
    public vida: number,
    public vida_objetivo: number,
    public objetivo: string,
    public personaje_kill: string,
    public escudo_objetivo: number,
  ) { }

}
