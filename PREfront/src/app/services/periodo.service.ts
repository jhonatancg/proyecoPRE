import { Injectable } from '@angular/core';
import { environment } from '../environment/environmet';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PeriodoResponse } from '../models/periodo.interface';

@Injectable({
  providedIn: 'root'
})
export class PeriodoService {
  private apiUrl = `${environment.apiUrl}/periodos`;

  constructor(private http: HttpClient) { }

  obtenerPeriodos(): Observable<PeriodoResponse> {
    return this.http.get<PeriodoResponse>(this.apiUrl);
  }
}
