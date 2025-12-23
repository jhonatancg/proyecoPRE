export interface Asistencia {
    id: number;
    fecha: string;          // YYYY-MM-DD
    hora_entrada: string;   // HH:MM:SS
    situacion: string;      // 'PUNTUAL', 'TARDE'
    estado?: number;        // 1 = Activo, 0 = Eliminado

    // Datos expandidos (Vienen de los JOINs en el Backend)
    alumno_id?: number;
    alumno_nombres?: string;
    alumno_apellidos?: string;
    alumno_dni?: string;    // Importante para búsqueda
    seccion?: string;       // Para saber de qué aula es
}

// Interfaz para la respuesta rápida del escáner (lo que muestra el kiosco)
export interface AsistenciaResponse {
    success: boolean;
    mensaje: string;
    data?: {
        id: number;
        alumno: string;     // Nombre completo concatenado
        hora: string;
        situacion: string;  // PUNTUAL / TARDE
        seccion?: string;
    };
}