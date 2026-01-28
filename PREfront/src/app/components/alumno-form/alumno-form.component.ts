import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AlumnoService } from '../../services/alumno.service';

@Component({
  selector: 'app-alumno-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './alumno-form.component.html',
  styleUrl: './alumno-form.component.css'
})
export class AlumnoFormComponent implements OnInit {
  alumnoForm: FormGroup;
  isEditMode: boolean = false;
  alumnoId: number | null = null;
  error: string = '';
  successMessage: string = '';

  constructor(private fb: FormBuilder, private AlumnoService: AlumnoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.alumnoForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required, Validators.minLength(3)]],
      dni_ce: ['', [Validators.required, Validators.minLength(3)]],
      genero: ['', [Validators.required]],
      celular: [''],
      apoderado: ['', [Validators.required, Validators.minLength(3)]],
      cel_apoderado: ['', [Validators.required, Validators.minLength(3)]],
    })
  }

  cargarAlumno(id: number) {
    this.AlumnoService.obternerAlumnoPorId(id).subscribe({
      next: (response) => {
        if (response.success && !Array.isArray(response.data)) {
          this.alumnoForm.patchValue(response.data!);
        }
      },
      error: (err) => {
        this.error = 'Error al cargar el alumno';
      }
    })
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.alumnoId = +params['id']
        this.cargarAlumno(this.alumnoId)
      }
    })
  }
  isFieldInvalid(fieldName: string): boolean {
    const field = this.alumnoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    const alumnoData = this.alumnoForm.value;

    if (this.isEditMode && this.alumnoId) {
      this.AlumnoService.modificarAlumno(this.alumnoId, alumnoData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = "Alumno actualizado correctamente";
            setTimeout(() => {
              this.router.navigate(['/alumnos']);
            }, 1500)
          }
        },
        error: (err) => {
          this.error = "Error al modificar el alumno";
        }
      })
    } else {
      this.AlumnoService.crearAlumno(alumnoData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = "Alumno creado correctamente";
            setTimeout(() => {
              this.router.navigate(['/alumnos']);
            }, 1500)
          }
        },
        error: (err) => {
          this.error = "Error al crear el alumno";
        }
      })
    }
  }

}
