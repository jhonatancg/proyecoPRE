import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// SERVICIOS
import { NivelService } from '../../services/nivel.service';
import { SeccionService } from '../../services/seccion.service';
import { AsistenciaService } from '../../services/asistencia.service';

// IMPORTACIONES PARA PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-asistencia-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistencia-list.component.html',
  styleUrls: ['./asistencia-list.component.css']
})
export class AsistenciaListComponent implements OnInit {

  // Variables
  niveles: any[] = [];
  todasLasSecciones: any[] = [];
  seccionesFiltradas: any[] = [];
  asistencias: any[] = [];

  nivelSeleccionado: number | null = null;
  seccionSeleccionada: number | null = null;
  fechaSeleccionada: string = new Date().toISOString().split('T')[0];

  cargando: boolean = false;
  busquedaRealizada: boolean = false;

  constructor(
    private nivelService: NivelService,
    private seccionService: SeccionService,
    private asistenciaService: AsistenciaService
  ) { }

  ngOnInit(): void {
    this.cargarDatosMaestros();
  }

  cargarDatosMaestros() {
    this.cargando = true;
    this.nivelService.obtenerNiveles().subscribe({
      next: (resNiv: any) => {
        this.niveles = resNiv.data || resNiv;
        this.seccionService.obtenerSecciones().subscribe({
          next: (resSec: any) => {
            this.todasLasSecciones = resSec.data || resSec;

            // Auto-selección inicial
            if (this.niveles.length > 0) {
              this.nivelSeleccionado = this.niveles[0].id;
              this.filtrarSecciones();
              if (this.seccionesFiltradas.length > 0) {
                this.seccionSeleccionada = this.seccionesFiltradas[0].id;
                this.buscarAsistencias();
              }
            }
            this.cargando = false;
          },
          error: () => this.cargando = false
        });
      },
      error: () => this.cargando = false
    });
  }

  onNivelChange() {
    this.seccionSeleccionada = null;
    this.filtrarSecciones();
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

  buscarAsistencias() {
    if (!this.nivelSeleccionado || !this.seccionSeleccionada || !this.fechaSeleccionada) {
      return;
    }

    this.cargando = true;
    this.busquedaRealizada = true;

    this.asistenciaService.obtenerAsistenciasPorAula(
      this.nivelSeleccionado,
      this.seccionSeleccionada,
      this.fechaSeleccionada
    ).subscribe({
      next: (res: any) => {
        this.asistencias = res.data || [];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error buscando asistencias', err);
        this.asistencias = [];
        this.cargando = false;
      }
    });
  }

  // --- FUNCIÓN PARA GENERAR PDF ---
  exportarPDF() {
    if (this.asistencias.length === 0) return;

    const doc = new jsPDF();

    // 1. Título y Encabezado del PDF
    doc.setFontSize(18);
    doc.text('Reporte de Asistencia', 14, 20);

    doc.setFontSize(10);
    doc.text(`Fecha: ${this.fechaSeleccionada}`, 14, 30);

    // Obtenemos nombre de sección y nivel para el subtítulo
    const seccion = this.seccionesFiltradas.find(s => s.id == this.seccionSeleccionada);
    const nivel = this.niveles.find(n => n.id == this.nivelSeleccionado);

    if (seccion && nivel) {
      doc.text(`Aula: ${seccion.nombre} - ${nivel.nombre}`, 14, 36);
    }

    // 2. Preparar los datos para la tabla
    const datosTabla = this.asistencias.map((item, index) => [
      index + 1,
      `${item.apellidos}, ${item.nombres}`,
      item.dni_ce,
      item.hora_entrada,
      item.situacion // PUNTUAL, TARDE, FALTA
    ]);

    // 3. Generar tabla con AutoTable
    autoTable(doc, {
      startY: 45,
      head: [['#', 'Alumno', 'DNI/CÓDIGO', 'Hora', 'Estado']],
      body: datosTabla,
      theme: 'grid',
      headStyles: { fillColor: [13, 71, 161] }, // Color Azul Primary
      // Colorear filas según estado
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const estado = data.cell.raw;
          if (estado === 'FALTA') {
            data.cell.styles.textColor = [220, 53, 69]; // Rojo
            data.cell.styles.fontStyle = 'bold';
          } else if (estado === 'TARDE') {
            data.cell.styles.textColor = [255, 193, 7]; // Amarillo oscuro
          } else {
            data.cell.styles.textColor = [25, 135, 84]; // Verde
          }
        }
      }
    });

    // 4. Descargar
    doc.save(`asistencia_${this.fechaSeleccionada}.pdf`);
  }
}