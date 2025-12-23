import { Injectable } from '@angular/core';
import { environment } from '../environment/environmet';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatriculaRequest, MatriculaResponse } from '../models/matricula.interface';

@Injectable({
  providedIn: 'root'
})
export class MatriculaService {
  private apiUrl = `${environment.apiUrl}/matriculas`;

  constructor(private http: HttpClient) { }

  obtenerMatriculas(): Observable<MatriculaResponse> {
    return this.http.get<MatriculaResponse>(this.apiUrl);
  }

  crearMatricula(datos: MatriculaRequest): Observable<MatriculaResponse> {
    return this.http.post<MatriculaResponse>(this.apiUrl, datos);
  }

  modificarMatricula(id: number, datos: { seccion_id: number; situacion: string }): Observable<MatriculaResponse> {
    return this.http.put<MatriculaResponse>(`${this.apiUrl}/${id}`, datos);
  }

  eliminarMatricula(id: number): Observable<MatriculaResponse> {
    return this.http.delete<MatriculaResponse>(`${this.apiUrl}/${id}`);
  }
}
