export interface Matricula {
    id: number;
    fecha_matricula: string;
    situacion: string;

    alumno_id: number;
    seccion_id: number;
    periodo_id: number;

    alumno_nombres: string;
    alumno_apellidos: string;

    nivel: string;

    seccion: string;

    periodo: string;
    anio_academico: number;
}

export interface MatriculaResponse {
    success: boolean;
    data?: Matricula | Matricula[];
    count?: number;
    mensaje?: string;
    error?: string;
}

export interface MatriculaRequest {
    alumno_id: number;
    seccion_id: number;
    periodo_id: number;
    situacion: string;
}