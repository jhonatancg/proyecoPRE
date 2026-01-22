import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Alumno } from '../../models/alumno.interface';
import { AlumnoService } from '../../services/alumno.service';
import { AuthService } from '../../services/auth.service';

import { CarnetDigitalComponent } from '../carnet-digital/carnet-digital.component';

@Component({
  selector: 'app-alumno-list',
  standalone: true,
  imports: [CommonModule, RouterLink, CarnetDigitalComponent],
  templateUrl: './alumno-list.component.html',
  styleUrl: './alumno-list.component.css'
})
export class AlumnoListComponent implements OnInit {
  alumnos: Alumno[] = [];
  error: string = '';

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

        if (response.success && Array.isArray(response.data)) {
          this.alumnos = response.data;
        } else if (Array.isArray(response)) {

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
          this.cargarAlumnos();
        },
        error: (err) => {
          console.error(err);
          this.error = 'Error al eliminar al alumno';
        }
      });
    }
  }

  verCarnet(alumno: Alumno) {
    this.alumnoSeleccionadoCarnet = alumno;
  }

  cerrarCarnet() {
    this.alumnoSeleccionadoCarnet = null;
  }
}