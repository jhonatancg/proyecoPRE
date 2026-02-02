import { Injectable } from '@angular/core';
import { environment } from '../environment/environmet'; // Verifica si es 'environment' o 'environmet' en tu proyecto
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AsistenciaResponse } from '../models/asistencia.interface'; // Si usas una interfaz, si no, usa 'any'

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  private apiUrl = `${environment.apiUrl}/asistencias`;

  constructor(private http: HttpClient) { }

  registrarAsistencia(dni: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { dni });
  }

  obtenerAsistenciasHoy(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/hoy`);
  }

  obtenerAsistenciasPorAula(nivelId: number, seccionId: number, fecha: string): Observable<any> {
    // Llama a la ruta: /api/asistencias/aula/:nivel/:seccion/:fecha
    return this.http.get<any>(`${this.apiUrl}/aula/${nivelId}/${seccionId}/${fecha}`);
  }
}