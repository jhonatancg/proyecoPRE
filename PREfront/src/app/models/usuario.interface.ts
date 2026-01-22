export interface Usuario {
    id: number;
    nombre_completo: string;
    usuario: string;
    rol?: string;
}

export interface LoginRequest {
    usuario: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    mensaje: string;
    token: string;
    usuario: Usuario;
}

export interface AuthResponse {
    success: boolean;
    mensaje: string;
    data?: any;
}