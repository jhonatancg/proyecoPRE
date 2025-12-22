import { Component, OnInit } from '@angular/core';
import { Alumno } from '../../models/alumno.interface';
import { AlumnoService } from '../../services/alumno.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-alumno-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './alumno-list.component.html',
  styleUrl: './alumno-list.component.css'
})
export class AlumnoListComponent implements OnInit {
  alumnos: Alumno[] = [];
  alumno!: Alumno;
  error: string = '';

  constructor(private alumnoService: AlumnoService) {
  }

  ngOnInit(): void {
    this.cargarAlumnos();
  }

  cargarAlumnos(): void {
    this.alumnoService.obtenerAlumnos().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.data)) {
          this.alumnos = response.data;
          console.log(this.alumnos)
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  eliminarAlumno(id: number) {
    if (confirm('¿Estás seguro de eliminar ese alumno?'))
      this.alumnoService.eliminarAlumno(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.cargarAlumnos();
          }
        },
        error: (err) => {
          this.error = 'Error al eliminar al alumno'
        }
      })
  }
}
