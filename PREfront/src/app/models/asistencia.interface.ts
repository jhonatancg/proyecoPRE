export interface Asistencia {
    id: number;
    fecha: string;
    hora_entrada: string;
    situacion: string;
    estado?: number;

    alumno_id?: number;
    alumno_nombres?: string;
    alumno_apellidos?: string;
    alumno_dni?: string;
    seccion?: string;
}

export interface AsistenciaResponse {
    success: boolean;
    mensaje: string;
    data?: {
        id: number;
        alumno: string;
        hora: string;
        situacion: string;
        seccion?: string;
    };
}