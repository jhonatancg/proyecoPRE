import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Matricula } from '../../models/matricula.interface';
import { MatriculaService } from '../../services/matricula.service';

@Component({
  selector: 'app-matricula-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './matricula-list.component.html',
  styleUrl: './matricula-list.component.css'
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
        // Tu backend devuelve { success: true, data: [...] }
        this.matriculas = res.data || res;
        this.loading = false;
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
          // Recargamos la lista para ver el cambio
          this.cargarMatriculas();
        },
        error: (err) => alert('Error al eliminar matrícula')
      });
    }
  }
}
