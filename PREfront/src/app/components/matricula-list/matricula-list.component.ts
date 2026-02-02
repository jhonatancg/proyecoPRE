import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Asegúrate de actualizar tu interfaz como puse arriba
import { Matricula } from '../../models/matricula.interface';
import { MatriculaService } from '../../services/matricula.service';

@Component({
  selector: 'app-matricula-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './matricula-list.component.html',
  styleUrls: ['./matricula-list.component.css']
})
export class MatriculaListComponent implements OnInit {

  matriculas: Matricula[] = [];
  loading: boolean = true;

  constructor(private matriculaService: MatriculaService) { }

  ngOnInit(): void {
    this.cargarMatriculas();
  }

  cargarMatriculas(): void {
    this.loading = true;
    this.matriculaService.obtenerMatriculas().subscribe({
      next: (res: any) => {
        // El backend devuelve: { success: true, data: [...] }
        // Si tu backend devuelve directo el array, usa 'res'. Si es objeto, 'res.data'
        this.matriculas = res.data || res;
        this.loading = false;

        // Opcional: Ver en consola para confirmar que llega el 'nivel'
        console.log('Matrículas cargadas:', this.matriculas);
      },
      error: (err) => {
        console.error('Error cargando matrículas', err);
        this.loading = false;
      }
    });
  }

  eliminarMatricula(id: number): void {
    if (confirm('¿Estás seguro de anular esta matrícula? El alumno perderá su vacante.')) {
      this.matriculaService.eliminarMatricula(id).subscribe({
        next: () => {
          this.cargarMatriculas(); // Recargar lista
        },
        error: (err) => alert('Error al eliminar matrícula')
      });
    }
  }
}