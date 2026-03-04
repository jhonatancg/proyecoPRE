import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
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
  returnUrl: string = '/home';

  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';

    if (this.authService.isAuthenticated()) {
      const usuario = this.authService.getCurrentUser();
      if (this.esRolPermitido(usuario?.rol)) {
        // MODIFICACIÓN AQUÍ: Redirigir a /asistencias si es auxiliar
        const rutaDestino = usuario?.rol === 'AUXILIAR' ? '/asistencias' : this.returnUrl;
        this.router.navigate([rutaDestino]);
      } else {
        this.authService.logout(); // Si no es permitido, cerramos la sesión antigua
      }
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          if (this.esRolPermitido(response.usuario.rol)) {
            // MODIFICACIÓN AQUÍ: Redirigir a /asistencias si es auxiliar
            const rutaDestino = response.usuario.rol === 'AUXILIAR' ? '/asistencias' : this.returnUrl;
            this.router.navigate([rutaDestino]);
          } else {
            this.error = 'Acceso denegado: Solo personal autorizado (Auxiliares y Admin).';
            this.authService.logout();
            this.loading = false;
          }

        }
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al iniciar sesión, verifique sus credenciales.';
        this.loading = false;
      },
      complete: () => {
        // Solo quitamos el loading si hubo error (si es éxito, la navegación ocurre)
        if (this.error) this.loading = false;
      }
    });
  }

  private esRolPermitido(rol: string | undefined): boolean {
    const rolesPermitidos = ['ADMIN', 'ADMINISTRADOR', 'AUXILIAR'];
    return rol ? rolesPermitidos.includes(rol) : false;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (fieldName === 'password' && field?.hasError('minlength')) {
      return 'Mínimo 4 caracteres';
    }
    return '';
  }
}