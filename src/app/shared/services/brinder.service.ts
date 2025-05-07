import { BrinderModel } from './../brinder.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatchModel } from '../match.model';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';
import { EquipoModel } from '../equipo.model';

@Injectable({
  providedIn: 'root',
})
export class BrinderService {
  BASE_URL = environment.BASE_URL;
  SECRET_KEY = environment.SECRET_KEY;

  constructor(private http: HttpClient) {}

  statusBackend() {
    return this.http.get<string>(this.BASE_URL + '/ping');
  }

  obtenerPersonajes(tipo: string): Observable<BrinderModel[]> {
    return this.http
      .get<BrinderModel[]>(`${this.BASE_URL}/personajes/${tipo}`)
      .pipe(
        map((personajes) =>
          personajes.map((personaje) => ({
            ...personaje,
            codigo: CryptoJS.AES.decrypt(
              personaje.codigo,
              this.SECRET_KEY
            ).toString(CryptoJS.enc.Utf8),
            alias: CryptoJS.AES.decrypt(
              personaje.alias,
              this.SECRET_KEY
            ).toString(CryptoJS.enc.Utf8),
          }))
        )
      );
  }

  obtenerPersonaje(id: string) {
    return this.http.get<BrinderModel[]>(
      `${this.BASE_URL}/personajes/personaje/${id}`
    );
  }

  obtenerMatches(tipo: string) {
    return this.http.get<any[]>(`${this.BASE_URL}/matches/todos/${tipo}`);
  }

  obtenerMatchesPersonaje(tipo: string, personaje_id: string) {
    return this.http.get<any[]>(
      `${this.BASE_URL}/matches/personajes/${tipo}/${personaje_id}`
    );
  }

  sendMatch(matchData: MatchModel) {
    return this.http.post(`${this.BASE_URL}/matches`, matchData);
  }

  agregarPersonaje(personaje: FormData) {
    return this.http.post<string>(
      `${this.BASE_URL}/personajes/agregar`,
      personaje
    );
  }

  updatePersonaje(id: string, personaje: Partial<BrinderModel>) {
    return this.http.put(`${this.BASE_URL}/personajes/editar/${id}`, personaje);
  }

  borrarPersonaje(id: string) {
    return this.http.delete<string>(`${this.BASE_URL}/personajes/borrar/${id}`);
  }

  enviarContacto(contacto: { nombre: string; mensaje: string; tipo: string }) {
    return this.http.post<string>(`${this.BASE_URL}/contacto`, contacto);
  }

  listarMensajesContacto(tipo: string) {
    return this.http.get<any[]>(`${this.BASE_URL}/contacto/${tipo}`);
  }

  enviarMensaje(buzon: {
    codigo_origen: string;
    codigo_destino: string;
    mensaje: string;
    tipo: string;
  }) {
    return this.http.post<string>(`${this.BASE_URL}/buzon/enviar`, buzon);
  }

  enviarAviso(aviso: { prioridad: string; mensaje: string; tipo: string }) {
    return this.http.post<string>(`${this.BASE_URL}/avisos`, aviso);
  }

  listarAvisos(tipo: string) {
    return this.http.get<any[]>(`${this.BASE_URL}/avisos/${tipo}`);
  }

  listarMensajesBuzon(tipo: string) {
    return this.http.get<any[]>(`${this.BASE_URL}/buzon/todos/${tipo}`);
  }

  listarMensajesRecibidos(codigoDestino: string) {
    return this.http.get<
      {
        id: number;
        codigo_origen: string;
        mensaje: string;
        fecha_envio: string;
      }[]
    >(`${this.BASE_URL}/buzon/recibidos/${codigoDestino}`);
  }

  listarMensajesEnviados(codigoOrigen: string) {
    return this.http.get<
      {
        id: number;
        codigo_origen: string;
        mensaje: string;
        fecha_envio: string;
      }[]
    >(`${this.BASE_URL}/buzon/enviados/${codigoOrigen}`);
  }

  actualizarAlias(codigo: string, alias: string) {
    return this.http.post<string>(`${this.BASE_URL}/buzon/actualizar-alias`, {
      codigo,
      alias,
    });
  }

  obtenerMedallas(id: string) {
    return this.http.get<any[]>(`${this.BASE_URL}/medallas/${id}`);
  }

  obtenerAllMedallas() {
    return this.http.get<any[]>(`${this.BASE_URL}/medallas/todas`);
  }

  tiposMedalla() {
    return this.http.get<any[]>(`${this.BASE_URL}/medallas/tipos/medalla`);
  }

  crearMedalla(medalla: {
    nombre: string;
    descripcion: string;
    icono_url: string;
  }) {
    return this.http.post<string>(
      `${this.BASE_URL}/medallas/crear-medalla`,
      medalla
    );
  }

  asignarMedalla(medalla: {
    personaje_id: string;
    medalla_id: string;
    asignado_por: string;
    titulo: string;
    nombre_personalizado: string;
  }) {
    return this.http.post<string>(
      `${this.BASE_URL}/medallas/asignar-medalla`,
      medalla
    );
  }

  eliminarMedalla(id: string) {
    return this.http.delete<string>(
      `${this.BASE_URL}/medallas/eliminar-medalla/${id}`
    );
  }

  /* KILLER */

  asignarEquipo(personaje_id: string, killer_id: string) {
    return this.http.post<{ equipo: string }>(
      `${this.BASE_URL}/killer/asignar-equipo`,
      {
        personaje_id,
        killer_id,
      }
    );
  }

  getEquipoAsignado(killerId: string, personaje_id?: string) {
    return this.http.get<EquipoModel>(
      `${this.BASE_URL}/killer/${killerId}/${personaje_id}`
    );
  }

  getPersonajesEquipo(killerId: string, equipo: string) {
    return this.http.get<any>(
      `${this.BASE_URL}/killer/${killerId}/equipo/${equipo}`
    );
  }

  tiposObjeto() {
    return this.http.get<any[]>(`${this.BASE_URL}/killer/objetos/tipos`);
  }

  asignarObjeto(objeto: {
    personaje_id: string;
    objeto_id: string;
    killer_id: string;
    equipo: string;
  }) {
    return this.http.post<string>(
      `${this.BASE_URL}/killer/objetos/asignar-objeto`,
      objeto
    );
  }

  verificarObjetoAsignadoHoy(personaje_id: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.BASE_URL}/killer/objetos/verificar/${personaje_id}`
    );
  }

  getMisObjetos(id_personaje: string) {
    return this.http.get<any[]>(
      `${this.BASE_URL}/killer/objetos/${id_personaje}`
    );
  }

  actualizarPersonajeKiller(
    killer_id: string,
    personaje_id: string,
    personaje_killer: any
  ) {
    return this.http.put(
      `${this.BASE_URL}/killer/${killer_id}/${personaje_id}`,
      personaje_killer
    );
  }

  eliminarObjeto(objetoId: string) {
    return this.http.put(
      `${this.BASE_URL}/killer/objetos/eliminar/${objetoId}`,
      null
    );
  }

  usarObjeto(objetoId: string) {
    return this.http.put(
      `${this.BASE_URL}/killer/objetos/usar/${objetoId}`,
      null
    );
  }

  registrarLogKiller(data: {
    killer_id: string;
    personaje_id: string;
    personaje_name: string;
    accion: string;
    objeto_id?: string | null;
    personaje_objetivo_id?: string | null;
    personaje_objetivo_name?: string | null;
    resultado: string;
    equipo: string;
  }) {
    return this.http.post(`${this.BASE_URL}/killer/log`, data);
  }

  obtenerLogKiller() {
    return this.http.get<any[]>(`${this.BASE_URL}/killer/log`);
  }
}
