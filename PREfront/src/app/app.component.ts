import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'PREfront';

  // Control del estado del menú
  isSidebarOpen: boolean = true;
  isMobile: boolean = false;

  constructor(public authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.checkScreenSize();
  }

  // Detectar cambios de tamaño de ventana
  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 992; // 992px es el punto de quiebre estándar

    // En móvil arranca cerrado, en PC arranca abierto
    if (this.isMobile) {
      this.isSidebarOpen = false;
    } else {
      this.isSidebarOpen = true;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // Cierra el menú solo si estamos en móvil (útil al hacer clic en un enlace)
  closeOnMobile() {
    if (this.isMobile) {
      this.isSidebarOpen = false;
    }
  }

  logout() {
    this.authService.logout();
  }

  // Verifica si el usuario logueado es Administrador o Director
  get isAdminOrDirector(): boolean {
    const usuario = this.authService.getCurrentUser();
    // Ajusta estos strings exactos según cómo los guardas en tu base de datos (ej: 'ADMIN', 'ADMINISTRADOR')
    return usuario?.rol === 'ADMIN' || usuario?.rol === 'DIRECTOR' || usuario?.rol === 'ADMINISTRADOR';
  }

  // --- NUEVA MODIFICACIÓN: Obtener siglas del rol para el Avatar ---
  get rolInitials(): string {
    const rol = this.authService.getCurrentUser()?.rol?.toUpperCase() || 'US';

    if (rol === 'ADMIN' || rol === 'ADMINISTRADOR') return 'AD';
    if (rol === 'AUXILIAR') return 'AUX';
    if (rol === 'DIRECTOR') return 'DI';

    // Por defecto, retorna las primeras dos letras del rol
    return rol.substring(0, 2);
  }
}