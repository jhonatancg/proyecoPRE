export interface Seccion {
    id: number;
    nombre: string;
    estado?: number;
}

export interface SeccionResponse {
    success: boolean;
    data?: Seccion | Seccion[];
    count?: number;
    mensaje?: string;
    error?: string;
}