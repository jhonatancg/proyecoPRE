export interface Alumno {
    id?: number;
    nombres: string;
    apellidos: string;
    dni_ce: string;
    genero: string;
    celular: string;
    apoderado: string;
    cel_apoderado: string;
}

export interface AlumnoResponse {
    success: boolean;
    data?: Alumno | Alumno[];
    count?: number;
    mensaje?: string;
    error?: string;
}