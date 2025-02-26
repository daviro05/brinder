import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  BASE_URL = environment.BASE_URL;

  constructor(private http: HttpClient) {}

  verificarCodigo(codigo: string): Observable<{ valido: boolean }> {
    return this.http.post<{ valido: boolean }>(`${this.BASE_URL}/verificar-codigo`, {codigo});
  }
}
