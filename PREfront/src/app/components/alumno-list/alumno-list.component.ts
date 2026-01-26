import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Alumno } from '../../models/alumno.interface';
import { AlumnoService } from '../../services/alumno.service';
import { AuthService } from '../../services/auth.service';

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

  constructor(
    private alumnoService: AlumnoService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.cargarAlumnos();
  }

  cargarAlumnos(): void {
    this.alumnoService.obtenerAlumnos().subscribe({
      next: (response) => {

        if (response.success && Array.isArray(response.data)) {
          this.alumnos = response.data;
        } else if (Array.isArray(response)) {

          this.alumnos = response;
        }
      },
      error: (err) => {
        console.error('Error al cargar alumnos:', err);
        this.error = 'No se pudieron cargar los alumnos.';
      }
    });
  }

  eliminarAlumno(id: number) {
    if (confirm('¿Estás seguro de eliminar este alumno?')) {
      this.alumnoService.eliminarAlumno(id).subscribe({
        next: (response) => {
          this.cargarAlumnos();
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

    // 1. CAMBIO A HORIZONTAL ('l' = landscape)
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = 297; // Ancho de A4 Horizontal
    const pageHeight = 210; // Alto de A4 Horizontal

    // 2. NUEVAS MEDIDAS (11cm x 17.5cm)
    const cardWidth = 110;  // 110mm ancho
    const cardHeight = 175; // 175mm alto

    // Cálculo de márgenes para centrar 2 carnets
    const marginX = (pageWidth - (cardWidth * 2)) / 3; // Espaciado equitativo
    const marginY = 15; // Margen superior (quedan aprox 20mm abajo)

    // 3. SOLO 2 POSICIONES (Izquierda y Derecha)
    const posiciones = [
      [marginX, marginY],                           // Posición 1 (Izquierda)
      [marginX * 2 + cardWidth, marginY]            // Posición 2 (Derecha)
    ];

    const container = document.getElementById('contenedor-carnets-masivos');
    if (!container) {
      console.error('No se encontró el contenedor masivo');
      this.generandoMasivo = false;
      return;
    }

    const cards = container.children;
    let cardsInPage = 0;

    for (let i = 0; i < this.alumnos.length; i++) {
      this.progresoMasivo = `Procesando ${i + 1} de ${this.alumnos.length}...`;

      const element = cards[i] as HTMLElement;

      try {
        // Aumentamos escala a 3 o 4 para mejor calidad en tamaño grande
        const canvas = await html2canvas(element, { scale: 3, logging: false, useCORS: true });
        const imgData = canvas.toDataURL('image/png');

        // Calcular posición (0 o 1)
        const posIndex = cardsInPage % 2;
        const [x, y] = posiciones[posIndex];

        // 4. NUEVA PÁGINA CADA 2 CARNETS
        if (cardsInPage > 0 && cardsInPage % 2 === 0) {
          pdf.addPage();
        }

        // Forzamos las medidas exactas (ancho y alto) para evitar deformaciones leves
        pdf.addImage(imgData, 'PNG', x, y, cardWidth, cardHeight);

        cardsInPage++;

      } catch (e) {
        console.error(`Error procesando carnet ${i}`, e);
      }
    }

    this.progresoMasivo = 'Finalizando PDF...';
    pdf.save('Carnets_Masivos_Alumnos.pdf');
    this.generandoMasivo = false;
  }
}