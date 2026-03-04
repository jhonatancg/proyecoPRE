import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Alumno } from '../../models/alumno.interface';
import { AlumnoService } from '../../services/alumno.service';
import { AuthService } from '../../services/auth.service';
import { MatriculaService } from '../../services/matricula.service';

import { CarnetDigitalComponent } from '../carnet-digital/carnet-digital.component';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-alumno-list',
  standalone: true,
  imports: [CommonModule, RouterLink, CarnetDigitalComponent],
  templateUrl: './alumno-list.component.html',
  styleUrl: './alumno-list.component.css'
})
export class AlumnoListComponent implements OnInit {
  alumnos: Alumno[] = [];
  error: string = '';

  alumnoSeleccionadoCarnet: Alumno | null = null;

  generandoMasivo: boolean = false;
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

  cargarAlumnos(): void {
    this.alumnoService.obtenerAlumnos().subscribe({
      next: (resAlumnos) => {
        let listaAlumnos: Alumno[] = [];

        if (resAlumnos.success && Array.isArray(resAlumnos.data)) {
          listaAlumnos = resAlumnos.data;
        } else if (Array.isArray(resAlumnos)) {
          listaAlumnos = resAlumnos;
        }

        // Una vez que tenemos los alumnos, traemos las matrículas
        this.matriculaService.obtenerMatriculas().subscribe({
          next: (resMatriculas) => {
            let listaMatriculas: any[] = [];

            if (resMatriculas.success && Array.isArray(resMatriculas.data)) {
              listaMatriculas = resMatriculas.data;
            } else if (Array.isArray(resMatriculas)) {
              listaMatriculas = resMatriculas;
            }

            // CRUCE DE DATOS: Le asignamos a cada alumno su nivel y sección
            listaAlumnos.forEach(alumno => {

              // SOLUCIÓN 1: Convertimos ambos a Number() para evitar fallos si uno es texto ("1") y otro número (1)
              const matricula = listaMatriculas.find(m => Number(m.alumno_id) === Number(alumno.id));

              if (matricula) {
                // SOLUCIÓN 2: Verificamos si el backend te está mandando la info o no
                alumno.nivel = matricula.nivel || matricula.grado || 'PRE'; // 'PRE' como respaldo
                alumno.seccion = matricula.seccion || 'A'; // 'A' como respaldo
              } else {
                alumno.nivel = 'No Matriculado';
                alumno.seccion = 'Sin Asignar';
              }
            });

            // Guardamos la lista completa y reiniciamos la paginación
            this.alumnos = listaAlumnos;
            this.currentPage = 1;
          },
          error: (err) => {
            console.error('Error al cargar matrículas', err);
            this.alumnos = listaAlumnos;
            this.currentPage = 1;
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar alumnos:', err);
        this.error = 'No se pudieron cargar los alumnos.';
      }
    });
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
  // -----------------------------

  eliminarAlumno(id: number) {
    if (confirm('¿Estás seguro de eliminar este alumno?')) {
      this.alumnoService.eliminarAlumno(id).subscribe({
        next: (response) => {
          this.cargarAlumnos(); // Refresca correctamente con los datos cruzados
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

  async descargarTodosLosCarnets() {
    if (this.alumnos.length === 0) return;

    this.generandoMasivo = true;
    this.progresoMasivo = 'Iniciando generación...';

    // A4 en Landscape (Horizontal) mide 297mm x 210mm
    const pdf = new jsPDF('l', 'mm', 'a4');

    // --- NUEVAS MEDIDAS EXACTAS (9.5 x 6.0 cm) ---
    const cardWidth = 95;
    const cardHeight = 60;

    const startX = 5; // Margen izquierdo de la hoja
    const startY = 10; // Margen superior de la hoja
    const gapX = 2; // Espacio entre carnets horizontal
    const gapY = 5; // Espacio entre carnets vertical

    // Generamos una grilla de 3x3 (Caben 9 carnets por hoja A4)
    const posiciones = [];
    for (let fila = 0; fila < 3; fila++) {
      for (let col = 0; col < 3; col++) {
        posiciones.push([
          startX + col * (cardWidth + gapX),
          startY + fila * (cardHeight + gapY)
        ]);
      }
    }

    const container = document.getElementById('contenedor-carnets-masivos');
    if (!container) {
      this.generandoMasivo = false;
      return;
    }
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

        const posIndex = cardsInPage % 9; // 9 carnets por página
        const [x, y] = posiciones[posIndex];

        // Si ya llenamos 9 carnets, creamos una nueva página
        if (cardsInPage > 0 && cardsInPage % 9 === 0) {
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
    pdf.save('Carnets_Masivos_Alumnos.pdf');
    this.generandoMasivo = false;
  }
}