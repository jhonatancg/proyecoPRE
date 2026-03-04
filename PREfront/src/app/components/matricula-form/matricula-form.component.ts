import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { Alumno } from '../../models/alumno.interface';
import { Seccion } from '../../models/seccion.interface';
import { Periodo } from '../../models/periodo.interface';
import { Nivel } from '../../models/nivel.interface';

import { MatriculaService } from '../../services/matricula.service';
import { AlumnoService } from '../../services/alumno.service';
import { SeccionService } from '../../services/seccion.service';
import { PeriodoService } from '../../services/periodo.service';
import { NivelService } from '../../services/nivel.service';

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
  seccionesFiltradas: Seccion[] = []; // Nueva lista para las secciones filtradas
  periodos: Periodo[] = [];
  niveles: Nivel[] = [];

  constructor(
    private fb: FormBuilder,
    private matriculaService: MatriculaService,
    private alumnoService: AlumnoService,
    private seccionService: SeccionService,
    private periodoService: PeriodoService,
    private nivelService: NivelService,
    private router: Router
  ) {
    this.matriculaForm = this.fb.group({
      alumno_id: ['', Validators.required],
      periodo_id: ['', Validators.required],
      nivel_id: ['', Validators.required], // Ahora es obligatorio
      seccion_id: [{ value: '', disabled: true }, Validators.required], // Empieza deshabilitado
      situacion: ['Ingresante', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarListasDesplegables();
  }

  cargarListasDesplegables(): void {

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

    this.nivelService.obtenerNiveles().subscribe({
      next: (res: any) => this.niveles = res.data || res,
      error: (err) => console.error('Error cargando niveles', err)
    });
  }

  // --- LÓGICA DE CASCADA NIVEL -> SECCIÓN ---
  onNivelChange(): void {
    const nivelId = this.matriculaForm.get('nivel_id')?.value;
    const seccionControl = this.matriculaForm.get('seccion_id');

    // Resetea el valor de la sección
    seccionControl?.setValue('');

    if (nivelId) {
      // Filtra las secciones que pertenecen al nivel seleccionado
      this.seccionesFiltradas = this.secciones.filter(s => s.nivel_id == nivelId);

      // Habilita el campo de sección si hay resultados
      if (this.seccionesFiltradas.length > 0) {
        seccionControl?.enable();
      } else {
        seccionControl?.disable();
      }
    } else {
      this.seccionesFiltradas = [];
      seccionControl?.disable();
    }
  }

  onSubmit(): void {
    if (this.matriculaForm.invalid) {
      this.matriculaForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const datosGuardar = {
      alumno_id: Number(this.matriculaForm.getRawValue().alumno_id),
      periodo_id: Number(this.matriculaForm.getRawValue().periodo_id),
      seccion_id: Number(this.matriculaForm.getRawValue().seccion_id),
      nivel_id: Number(this.matriculaForm.getRawValue().nivel_id),
      situacion: this.matriculaForm.getRawValue().situacion
    };

    this.matriculaService.crearMatricula(datosGuardar).subscribe({
      next: () => {
        this.router.navigate(['/matriculas']);
      },
      error: (err) => {
        alert(err.error?.mensaje || 'Error al registrar la matrícula');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.matriculaForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}