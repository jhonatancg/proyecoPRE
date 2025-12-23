import { Injectable } from '@angular/core';
import { environment } from '../environment/environmet';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SeccionResponse } from '../models/seccion.interface';

@Injectable({
  providedIn: 'root'
})
export class SeccionService {
  private apiUrl = `${environment.apiUrl}/secciones`;
  constructor(private http: HttpClient) { }

  obtenerSecciones(): Observable<SeccionResponse> {
    return this.http.get<SeccionResponse>(this.apiUrl);
  }
}

