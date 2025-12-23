import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router'; // Agregué RouterModule
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading: boolean = false;
  error: string = '';
  returnUrl: string = '/alumnos'; // Ruta por defecto tras loguearse

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Definimos el formulario con 'usuario' en lugar de 'email'
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]] // Bajé el mínimo a 4 por si acaso
    });
  }

  ngOnInit(): void {
    // 1. Obtener la URL a la que el usuario quería ir antes de que lo mandaran al login
    // Si no hay ninguna, vamos a '/alumnos'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/alumnos';

    // 2. Si ya está logueado, no dejarlo ver el login y mandarlo adentro
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    // Enviamos { usuario, password }
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          // Si el login es correcto, el AuthService ya guardó el token.
          // Nosotros solo redirigimos.
          this.router.navigate([this.returnUrl]);
        }
      },
      error: (err) => {
        // Manejamos el error que viene del backend
        this.error = err.error?.mensaje || 'Error al iniciar sesión, intente nuevamente.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // Helper para saber si un campo tiene error visual
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Mensajes de error dinámicos
  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }

    if (fieldName === 'password' && field?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 4 caracteres';
    }

    return '';
  }
}