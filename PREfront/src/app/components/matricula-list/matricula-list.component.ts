import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Interfaces y Servicios
import { Matricula } from '../../models/matricula.interface';
import { MatriculaService } from '../../services/matricula.service';
import { NivelService } from '../../services/nivel.service';
import { SeccionService } from '../../services/seccion.service';

@Component({
  selector: 'app-matricula-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './matricula-list.component.html',
  styleUrls: ['./matricula-list.component.css']
})
export class MatriculaListComponent implements OnInit {

  // --- DATOS ---
  matriculas: Matricula[] = [];
  niveles: any[] = [];
  todasLasSecciones: any[] = [];

  // Listas filtradas
  seccionesFiltradas: any[] = [];      // Para el filtro principal
  modalSeccionesFiltradas: any[] = []; // Para el filtro dentro del modal

  // --- FILTROS DE BÚSQUEDA ---
  nivelSeleccionado: number | null = null;
  seccionSeleccionada: number | null = null;

  // --- ESTADOS ---
  loading: boolean = false;
  busquedaRealizada: boolean = false;

  // --- MODAL DE EDICIÓN ---
  mostrarModal: boolean = false;
  editandoMatricula: any = null;

  // Datos temporales del modal
  modalNivelId: number | null = null;
  modalSeccionId: number | null = null;
  modalSituacion: string = '';

  constructor(
    private matriculaService: MatriculaService,
    private nivelService: NivelService,
    private seccionService: SeccionService
  ) { }

  ngOnInit(): void {
    this.cargarDatosMaestros();
  }

  // 1. CARGA INICIAL DE COMBOS
  cargarDatosMaestros() {
    this.loading = true;
    this.nivelService.obtenerNiveles().subscribe({
      next: (res: any) => {
        this.niveles = res.data || res;

        this.seccionService.obtenerSecciones().subscribe({
          next: (resSec: any) => {
            this.todasLasSecciones = resSec.data || resSec;
            this.loading = false;

            // Opcional: Auto-seleccionar primer nivel al entrar
            if (this.niveles.length > 0) {
              this.nivelSeleccionado = this.niveles[0].id;
              this.filtrarSecciones();
            }
          },
          error: () => this.loading = false
        });
      },
      error: () => this.loading = false
    });
  }

  // --- LÓGICA DE FILTROS PRINCIPALES ---
  onNivelChange() {
    this.seccionSeleccionada = null;
    this.filtrarSecciones();

    // Auto-seleccionar primera sección
    if (this.seccionesFiltradas.length > 0) {
      this.seccionSeleccionada = this.seccionesFiltradas[0].id;
    }
  }

  filtrarSecciones() {
    if (!this.nivelSeleccionado) {
      this.seccionesFiltradas = [];
      return;
    }
    this.seccionesFiltradas = this.todasLasSecciones.filter(sec =>
      sec.nivel_id == this.nivelSeleccionado
    );
  }

  buscarMatriculas() {
    if (!this.nivelSeleccionado || !this.seccionSeleccionada) return;

    this.loading = true;
    this.busquedaRealizada = true;

    this.matriculaService.obtenerMatriculasPorAula(this.nivelSeleccionado, this.seccionSeleccionada)
      .subscribe({
        next: (res: any) => {
          this.matriculas = res.data || [];
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.matriculas = [];
          this.loading = false;
        }
      });
  }

  eliminarMatricula(id: number) {
    if (confirm('¿Estás seguro de anular esta matrícula?')) {
      this.matriculaService.eliminarMatricula(id).subscribe({
        next: () => this.buscarMatriculas(),
        error: () => alert('Error al eliminar')
      });
    }
  }

  // --- LÓGICA DEL MODAL DE EDICIÓN ---

  abrirModalEditar(matricula: any) {
    this.editandoMatricula = matricula;
    this.modalSituacion = matricula.situacion;
    this.modalSeccionId = matricula.seccion_id;

    // Detectar Nivel actual basado en la sección
    const seccionActual = this.todasLasSecciones.find(s => s.id == matricula.seccion_id);
    this.modalNivelId = seccionActual ? seccionActual.nivel_id : (this.niveles[0]?.id || null);

    this.filtrarSeccionesModal();
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.editandoMatricula = null;
  }

  onNivelModalChange() {
    this.modalSeccionId = null; // Resetear sección al cambiar nivel
    this.filtrarSeccionesModal();
  }

  filtrarSeccionesModal() {
    if (this.modalNivelId) {
      this.modalSeccionesFiltradas = this.todasLasSecciones.filter(s =>
        s.nivel_id == this.modalNivelId
      );
    } else {
      this.modalSeccionesFiltradas = [];
    }
  }

  guardarEdicion() {
    if (!this.modalSeccionId || !this.modalSituacion) {
      alert('Complete los datos');
      return;
    }

    const datos = {
      seccion_id: this.modalSeccionId,
      situacion: this.modalSituacion
    };

    this.loading = true;
    this.matriculaService.actualizarMatricula(this.editandoMatricula.id, datos).subscribe({
      next: () => {
        alert('Matrícula actualizada');
        this.cerrarModal();
        this.buscarMatriculas(); // Refrescar lista
      },
      error: () => {
        alert('Error al actualizar');
        this.loading = false;
      }
    });
  }
}