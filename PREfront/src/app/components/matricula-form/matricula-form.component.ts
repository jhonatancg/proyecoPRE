import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Alumno } from '../../models/alumno.interface';
import { Seccion } from '../../models/seccion.interface';
import { Periodo } from '../../models/periodo.interface';
import { MatriculaService } from '../../services/matricula.service';
import { AlumnoService } from '../../services/alumno.service';
import { SeccionService } from '../../services/seccion.service';
import { PeriodoService } from '../../services/periodo.service';

@Component({
  selector: 'app-matricula-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './matricula-form.component.html',
  styleUrl: './matricula-form.component.css'
})
export class MatriculaFormComponent implements OnInit {
  matriculaForm: FormGroup;
  loading: boolean = false;

  alumnos: Alumno[] = [];
  secciones: Seccion[] = [];
  periodos: Periodo[] = [];

  constructor(
    private fb: FormBuilder,
    private matriculaService: MatriculaService,
    private alumnoService: AlumnoService,
    private seccionService: SeccionService,
    private periodoService: PeriodoService,
    private router: Router
  ) {
    this.matriculaForm = this.fb.group({
      alumno_id: ['', [Validators.required]],
      periodo_id: ['', [Validators.required]],
      seccion_id: ['', [Validators.required]],
      situacion: ['Ingresante', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarListasDesplegables();
  }

  cargarListasDesplegables(): void {
    console.log('--- INICIANDO CARGA DE DATOS ---');

    this.alumnoService.obtenerAlumnos().subscribe({
      next: (res: any) => this.alumnos = res.data || res,
      error: (err) => console.error('Error cargando alumnos', err)
    });

    this.periodoService.obtenerPeriodos().subscribe({
      next: (res: any) => this.periodos = res.data || res,
      error: (err) => console.error('Error cargando periodos', err)
    });

    this.seccionService.obtenerSecciones().subscribe({
      next: (res: any) => this.secciones = res.data || res,
      error: (err) => console.error('Error cargando secciones', err)
    });
  }

  onSubmit(): void {
    if (this.matriculaForm.invalid) {
      this.matriculaForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const datosGuardar = {
      ...this.matriculaForm.value,
      alumno_id: Number(this.matriculaForm.value.alumno_id),
      periodo_id: Number(this.matriculaForm.value.periodo_id),
      seccion_id: Number(this.matriculaForm.value.seccion_id)
    };

    this.matriculaService.crearMatricula(datosGuardar).subscribe({
      next: (res) => {
        this.router.navigate(['/matriculas']);
      },
      error: (err) => {
        alert(err.error.mensaje || 'Error al registrar la matrícula');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const formControl = this.matriculaForm.get(field);
    return !!(formControl && formControl.invalid && (formControl.dirty || formControl.touched));
  }
}
