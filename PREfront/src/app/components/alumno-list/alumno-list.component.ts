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

    // Al usar JPEG y Escala 3, consumimos mucha menos memoria.
    // Intentaremos generar todo en UN SOLO ARCHIVO. 
    // (Si tienes más de 100 alumnos, avísame para activar el modo por lotes de nuevo).

    const pdf = new jsPDF('l', 'mm', 'a4');

    // --- MEDIDAS EXACTAS ---
    const cardWidth = 98;
    const cardHeight = 155;
    const marginLeft = 1;
    const gap = 0.5;
    const marginY = 15;

    const posiciones = [
      [marginLeft, marginY],
      [marginLeft + cardWidth + gap, marginY],
      [marginLeft + (cardWidth * 2) + (gap * 2), marginY]
    ];

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
        // === EL PUNTO DULCE DE CALIDAD ===
        const canvas = await html2canvas(carnetElement, {
          scale: 3,           // 3 es CALIDAD DE IMPRESIÓN (300 DPI aprox)
          logging: false,
          useCORS: true,
          backgroundColor: null
        });

        // === LA CLAVE DEL AHORRO DE MEMORIA ===
        // Usamos JPEG al 90% (0.9). 
        // Se ve nítido, pero pesa 10 veces menos que PNG.
        const imgData = canvas.toDataURL('image/jpeg', 0.9);

        const posIndex = cardsInPage % 3;
        const [x, y] = posiciones[posIndex];

        if (cardsInPage > 0 && cardsInPage % 3 === 0) {
          pdf.addPage();
        }

        // IMPORTANTE: Decirle al PDF que es JPEG
        pdf.addImage(imgData, 'JPEG', x, y, cardWidth, cardHeight);

        cardsInPage++;

        // Pequeña pausa para no bloquear la pantalla
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