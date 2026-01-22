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

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;

    // Configuración de la cuadrícula
    const cardWidth = 85;  // Ancho tarjeta
    const cardHeight = 130; // Altura estimada (ajustar según tu diseño real)
    const marginX = (pageWidth - (cardWidth * 2)) / 3; // Margen para centrar horizontalmente
    const marginY = 15; // Margen superior inicial

    // Coordenadas para 4 tarjetas: [x, y]
    const posiciones = [
      [marginX, marginY],                               // Arriba Izquierda
      [marginX * 2 + cardWidth, marginY],               // Arriba Derecha
      [marginX, marginY + cardHeight + 10],             // Abajo Izquierda
      [marginX * 2 + cardWidth, marginY + cardHeight + 10] // Abajo Derecha
    ];

    // Obtenemos el contenedor oculto que tiene todos los carnets
    const container = document.getElementById('contenedor-carnets-masivos');
    if (!container) {
      console.error('No se encontró el contenedor masivo');
      this.generandoMasivo = false;
      return;
    }

    // Obtenemos los hijos (cada carnet individual)
    const cards = container.children;
    let cardsInPage = 0; // Contador para saber cuándo crear nueva página

    for (let i = 0; i < this.alumnos.length; i++) {
      this.progresoMasivo = `Procesando ${i + 1} de ${this.alumnos.length}...`;

      // Obtener el elemento DOM del carnet específico
      // Nota: El primer hijo suele ser el 'carnet-container' gracias al selector de componente
      const element = cards[i] as HTMLElement;

      // Capturar imagen
      try {
        const canvas = await html2canvas(element, { scale: 2, logging: false, useCORS: true });
        const imgData = canvas.toDataURL('image/png');

        // Calcular posición
        const posIndex = cardsInPage % 4;
        const [x, y] = posiciones[posIndex];

        // Si es el primer elemento de un bloque de 4 (y no es el absoluto primero), nueva página
        if (cardsInPage > 0 && cardsInPage % 4 === 0) {
          pdf.addPage();
        }

        // Agregar imagen al PDF
        // Ajustamos la altura proporcionalmente para que no se deforme
        const imgProps = pdf.getImageProperties(imgData);
        const pdfH = (imgProps.height * cardWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', x, y, cardWidth, pdfH);

        cardsInPage++;

      } catch (e) {
        console.error(`Error procesando carnet ${i}`, e);
      }
    }

    this.progresoMasivo = 'Finalizando PDF...';
    pdf.save('Carnets_Alumnos.pdf');
    this.generandoMasivo = false;
  }
}