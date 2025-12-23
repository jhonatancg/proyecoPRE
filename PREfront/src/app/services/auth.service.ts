import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of, map } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../environment/environmet';

import {
  Usuario,
  LoginRequest,
  LoginResponse,
  AuthResponse
} from '../models/usuario.interface';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            this.setSession(response);
          }
        })
      );
  }

  verificarToken(): Observable<boolean> {

    if (!this.getToken()) {
      return of(false);
    }

    return this.http.get<AuthResponse>(`${this.apiUrl}/verificar`).pipe(
      map(res => {
        return res.success;
      }),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private setSession(authResult: LoginResponse): void {
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('usuario', JSON.stringify(authResult.usuario));
    this.currentUserSubject.next(authResult.usuario);
  }

  private loadUserFromStorage(): void {
    const usuarioString = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');

    if (usuarioString && token) {
      try {
        const usuario = JSON.parse(usuarioString);
        this.currentUserSubject.next(usuario);
      } catch (error) {
        console.error('Error al parsear usuario:', error);
        this.logout();
      }
    }
  }


  getToken(): string | null {
    return localStorage.getItem('token');
  }


  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiracion = payload.exp * 1000;

      if (Date.now() >= expiracion) {
        this.logout();
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const usuario = this.getCurrentUser();
    return usuario?.rol === 'ADMIN' || usuario?.rol === 'DIRECTOR';
  }
}