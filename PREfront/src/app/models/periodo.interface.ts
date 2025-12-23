export interface Periodo {
    id: number;
    nombre: string;
    anio: number;
    fecha_inicio: string;
    fecha_fin: string;
    situacion?: string;
}

export interface PeriodoResponse {
    success: boolean;
    data?: Periodo | Periodo[];
    count?: number;
    mensaje?: string;
    error?: string;
}