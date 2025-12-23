import { Injectable } from '@angular/core';
import { environment } from '../environment/environmet';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AsistenciaResponse } from '../models/asistencia.interface';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  private apiUrl = `${environment.apiUrl}/asistencias`;

  constructor(private http: HttpClient) { }

  // Enviar el DNI escaneado
  registrarAsistencia(dni: string): Observable<AsistenciaResponse> {
    return this.http.post<AsistenciaResponse>(this.apiUrl, { dni });
  }

  obtenerAsistenciasHoy(): Observable<AsistenciaResponse> {
    return this.http.get<AsistenciaResponse>(`${this.apiUrl}/hoy`);
  }
}
