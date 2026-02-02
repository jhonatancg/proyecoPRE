export interface Nivel {
    id: number;
    nombre: string;
    estado?: number;
}

export interface NivelResponse {
    success: boolean;
    data?: Nivel | Nivel[];
    count?: number;
    mensaje?: string;
    error?: string;
}

export interface NivelRequest {
    nombre: string;
}
