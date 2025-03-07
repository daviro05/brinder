import { BrinderModel } from './../brinder.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatchModel } from '../match.model';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';

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
    return this.http.get<BrinderModel[]>(`${this.BASE_URL}/personaje/${id}`);
  }

  obtenerMatches(tipo: string) {
    return this.http.get<any[]>(`${this.BASE_URL}/matches/todos/${tipo}`);
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

  listarMensajesBuzon(tipo: string) {
    return this.http.get<any[]>(`${this.BASE_URL}/buzon/todos/${tipo}`);
  }

  listarMensajes(codigoDestino: string) {
    return this.http.get<
      {
        id: number;
        codigo_origen: string;
        mensaje: string;
        fecha_envio: string;
      }[]
    >(`${this.BASE_URL}/buzon/${codigoDestino}`);
  }

  actualizarAlias(codigo: string, alias: string) {
    return this.http.post<string>(`${this.BASE_URL}/actualizar-alias`, {
      codigo,
      alias,
    });
  }
}
