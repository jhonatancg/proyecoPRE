import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    // Clonamos la request SIEMPRE (tenga token o no)
    req = req.clone({
        setHeaders: {
            // 1. HEADER OBLIGATORIO PARA QUE NGROK NO FALLE (Siempre)
            'ngrok-skip-browser-warning': 'true',

            // 2. Token de Autorización (Solo si existe)
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    });

    return next(req);
};