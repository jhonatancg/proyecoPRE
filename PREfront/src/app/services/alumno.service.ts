import { Injectable } from '@angular/core';
import { environment } from '../environment/environmet';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alumno, AlumnoResponse } from '../models/alumno.interface';

@Injectable({
  providedIn: 'root'
})
export class AlumnoService {

  private apiUrl = `${environment.apiUrl}/alumnos`;

  constructor(private http: HttpClient) { }

  obtenerAlumnos(): Observable<AlumnoResponse> {
    return this.http.get<AlumnoResponse>(this.apiUrl);
  }

  obternerAlumnoPorId(id: number): Observable<AlumnoResponse> {
    return this.http.get<AlumnoResponse>(`${this.apiUrl}/${id}`);
  }

  eliminarAlumno(id: number): Observable<AlumnoResponse> {
    return this.http.delete<AlumnoResponse>(`${this.apiUrl}/${id}`);
  }

  crearAlumno(alumno: Alumno): Observable<AlumnoResponse> {
    return this.http.post<AlumnoResponse>(this.apiUrl, alumno);
  }

  modificarAlumno(id: number, alumno: Alumno): Observable<AlumnoResponse> {
    return this.http.put<AlumnoResponse>(`${this.apiUrl}/${id}`, alumno);
  }
}
