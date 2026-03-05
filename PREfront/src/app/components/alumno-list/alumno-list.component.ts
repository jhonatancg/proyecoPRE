import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Alumno } from '../../models/alumno.interface';
import { AlumnoService } from '../../services/alumno.service';
import { AuthService } from '../../services/auth.service';
import { MatriculaService } from '../../services/matricula.service';

// Solo importamos el carnet original (pequeño)
import { CarnetDigitalComponent } from '../carnet-digital/carnet-digital.component';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-alumno-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CarnetDigitalComponent],
  templateUrl: './alumno-list.component.html',
  styleUrl: './alumno-list.component.css'
})
export class AlumnoListComponent implements OnInit {
  alumnos: Alumno[] = [];
  error: string = '';
  cargando: boolean = false;

  // --- VARIABLES DE BÚSQUEDA ---
  terminoBusqueda: string = '';
  busquedaRealizada: boolean = false;

  alumnoSeleccionadoCarnet: Alumno | null = null;

  // --- VARIABLES DE DESCARGA MASIVA ---
  generandoMasivo: boolean = false; // Renombrado a uno solo
  progresoMasivo: string = '';

  // --- VARIABLES DE PAGINACIÓN ---
  currentPage: number = 1;
  itemsPerPage: number = 20;

  constructor(
    private alumnoService: AlumnoService,
    private authService: AuthService,
    private matriculaService: MatriculaService
  ) { }

  ngOnInit(): void {
    this.cargarAlumnos();
  }

  // ==========================================
  // LÓGICA DE CARGA Y BÚSQUEDA
  // ==========================================
  cargarAlumnos(): void {
    this.cargando = true;
    this.busquedaRealizada = false;
    this.terminoBusqueda = '';

    this.alumnoService.obtenerAlumnos().subscribe({
      next: (res) => this.procesarRespuestaAlumnos(res),
      error: (err) => this.manejarErrorCarga(err)
    });
  }

  buscarAlumnos(): void {
    const termino = this.terminoBusqueda.trim();

    if (!termino) {
      this.cargarAlumnos();
      return;
    }

    this.cargando = true;
    this.busquedaRealizada = true;

    const esSoloNumeros = /^\d+$/.test(termino);

    if (esSoloNumeros) {
      this.alumnoService.buscarAlumnoPorDni(termino).subscribe({
        next: (res) => this.procesarRespuestaAlumnos(res),
        error: (err) => this.manejarErrorCarga(err)
      });
    } else {
      this.alumnoService.buscarAlumnosPorNombreApellido(termino).subscribe({
        next: (res) => this.procesarRespuestaAlumnos(res),
        error: (err) => this.manejarErrorCarga(err)
      });
    }
  }

  limpiarBusqueda(): void {
    this.cargarAlumnos();
  }

  private procesarRespuestaAlumnos(resAlumnos: any): void {
    let listaAlumnos: Alumno[] = [];

    if (resAlumnos.success && Array.isArray(resAlumnos.data)) {
      listaAlumnos = resAlumnos.data;
    } else if (Array.isArray(resAlumnos)) {
      listaAlumnos = resAlumnos;
    }

    if (listaAlumnos.length === 0) {
      this.alumnos = [];
      this.cargando = false;
      this.currentPage = 1;
      return;
    }

    this.matriculaService.obtenerMatriculas().subscribe({
      next: (resMatriculas) => {
        let listaMatriculas: any[] = [];

        if (resMatriculas.success && Array.isArray(resMatriculas.data)) {
          listaMatriculas = resMatriculas.data;
        } else if (Array.isArray(resMatriculas)) {
          listaMatriculas = resMatriculas;
        }

        listaAlumnos.forEach(alumno => {
          const matricula = listaMatriculas.find(m => Number(m.alumno_id) === Number(alumno.id));
          if (matricula) {
            alumno.nivel = matricula.nivel || matricula.grado || 'PRE';
            alumno.seccion = matricula.seccion || 'A';
          } else {
            alumno.nivel = 'No Matriculado';
            alumno.seccion = 'Sin Asignar';
          }
        });

        this.alumnos = listaAlumnos;
        this.currentPage = 1;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar matrículas', err);
        this.alumnos = listaAlumnos;
        this.currentPage = 1;
        this.cargando = false;
      }
    });
  }

  private manejarErrorCarga(err: any): void {
    console.error('Error en la petición:', err);
    this.error = 'Ocurrió un error al consultar los datos.';
    this.alumnos = [];
    this.cargando = false;
  }

  // --- MÉTODOS DE PAGINACIÓN ---
  get paginatedAlumnos(): Alumno[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.alumnos.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.alumnos.length / this.itemsPerPage) || 1;
  }

  get startIndexRecord(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndexRecord(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.alumnos.length);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // --- ACCIONES INDIVIDUALES ---
  eliminarAlumno(id: number) {
    if (confirm('¿Estás seguro de eliminar este alumno?')) {
      this.alumnoService.eliminarAlumno(id).subscribe({
        next: () => {
          this.busquedaRealizada ? this.buscarAlumnos() : this.cargarAlumnos();
        },
        error: (err) => {
          console.error(err);
          this.error = 'Error al eliminar al alumno';
        }
      });
    }
  }

  verCarnet(alumno: Alumno) {
    this.alumnoSeleccionadoCarnet = alumno;
  }

  cerrarCarnet() {
    this.alumnoSeleccionadoCarnet = null;
  }

  // ==============================================================
  // DESCARGA MASIVA CARNET PEQUEÑO (9.5 x 5.8 cm) - 10 por Hoja
  // ==============================================================
  async descargarCarnets() {
    if (this.alumnos.length === 0) return;

    this.generandoMasivo = true;
    this.progresoMasivo = 'Iniciando Carnets...';

    const pdf = new jsPDF('p', 'mm', 'a4');

    const cardWidth = 95;
    const cardHeight = 58;

    const startX = 7.5;
    const startY = 3.5;
    const gapX = 5;
    const gapY = 0;

    const posiciones = [];
    for (let fila = 0; fila < 5; fila++) {
      for (let col = 0; col < 2; col++) {
        posiciones.push([
          startX + col * (cardWidth + gapX),
          startY + fila * (cardHeight + gapY)
        ]);
      }
    }

    const container = document.getElementById('contenedor-carnets-masivos');
    if (!container) { this.generandoMasivo = false; return; }

    await this.procesarPDF(pdf, container, posiciones, cardWidth, cardHeight, 10, 'Carnets_Alumnos_9x6.pdf');
    this.generandoMasivo = false;
  }

  // ==============================================================
  // FUNCIÓN REUTILIZABLE PARA GENERAR EL PDF
  // ==============================================================
  private async procesarPDF(pdf: jsPDF, container: HTMLElement, posiciones: number[][],
    cardWidth: number, cardHeight: number, limitPerPage: number, filename: string) {

    const wrapperDivs = container.children;
    let cardsInPage = 0;

    for (let i = 0; i < this.alumnos.length; i++) {
      this.progresoMasivo = `Procesando ${i + 1} de ${this.alumnos.length}...`;

      const wrapper = wrapperDivs[i] as HTMLElement;
      const carnetElement = wrapper.querySelector('.carnet-container') as HTMLElement;

      if (!carnetElement) continue;

      try {
        const canvas = await html2canvas(carnetElement, {
          scale: 3,
          logging: false,
          useCORS: true,
          backgroundColor: null
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const posIndex = cardsInPage % limitPerPage;
        const [x, y] = posiciones[posIndex];

        if (cardsInPage > 0 && cardsInPage % limitPerPage === 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'JPEG', x, y, cardWidth, cardHeight);
        cardsInPage++;

        if (i % 5 === 0) await new Promise(r => setTimeout(r, 20));

      } catch (e) {
        console.error(`Error procesando carnet ${i}`, e);
      }
    }

    this.progresoMasivo = 'Finalizando PDF...';
    pdf.save(filename);
  }
}