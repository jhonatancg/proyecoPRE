import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Servicios e Interfaces
import { Alumno } from '../../models/alumno.interface';
import { AlumnoService } from '../../services/alumno.service';
import { AuthService } from '../../services/auth.service';

// IMPORTANTE: Importar el componente del Carnet
import { CarnetDigitalComponent } from '../carnet-digital/carnet-digital.component';

@Component({
  selector: 'app-alumno-list',
  standalone: true,
  // IMPORTANTE: Agregar CarnetDigitalComponent aquí
  imports: [CommonModule, RouterLink, CarnetDigitalComponent],
  templateUrl: './alumno-list.component.html',
  styleUrl: './alumno-list.component.css'
})
export class AlumnoListComponent implements OnInit {
  alumnos: Alumno[] = [];
  error: string = '';

  // Variable para controlar qué alumno se muestra en el modal del Carnet
  alumnoSeleccionadoCarnet: Alumno | null = null;

  constructor(
    private alumnoService: AlumnoService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.cargarAlumnos();
  }

  cargarAlumnos(): void {
    this.alumnoService.obtenerAlumnos().subscribe({
      next: (response) => {
        // Aseguramos que data sea un array, a veces la API devuelve directo el array
        if (response.success && Array.isArray(response.data)) {
          this.alumnos = response.data;
        } else if (Array.isArray(response)) {
          // Por si acaso tu backend devolviera el array directo sin envoltura
          this.alumnos = response;
        }
      },
      error: (err) => {
        console.error('Error al cargar alumnos:', err);
        this.error = 'No se pudieron cargar los alumnos.';
      }
    });
  }

  eliminarAlumno(id: number) {
    if (confirm('¿Estás seguro de eliminar este alumno?')) {
      this.alumnoService.eliminarAlumno(id).subscribe({
        next: (response) => {
          // Verificamos response.success o simplemente recargamos si no hay error
          this.cargarAlumnos();
        },
        error: (err) => {
          console.error(err);
          this.error = 'Error al eliminar al alumno';
        }
      });
    }
  }

  // --- MÉTODOS PARA EL CARNET DIGITAL ---

  verCarnet(alumno: Alumno) {
    this.alumnoSeleccionadoCarnet = alumno;
  }

  cerrarCarnet() {
    this.alumnoSeleccionadoCarnet = null;
  }
}