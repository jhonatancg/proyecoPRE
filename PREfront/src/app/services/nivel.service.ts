import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Nivel } from '../models/nivel.interface';

@Injectable({
    providedIn: 'root'
})
export class NivelService {

    private apiUrl = 'http://localhost:3000/api/niveles';

    constructor(private http: HttpClient) { }

    obtenerNiveles(): Observable<any> {
        return this.http.get<any>(this.apiUrl);
    }

    crearNivel(data: { nombre: string }): Observable<any> {
        return this.http.post<any>(this.apiUrl, data);
    }

    modificarNivel(id: number, data: { nombre: string }): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, data);
    }

    eliminarNivel(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
}
