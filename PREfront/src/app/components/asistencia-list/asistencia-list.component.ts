import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NivelService } from '../../services/nivel.service';
import { SeccionService } from '../../services/seccion.service';
import { AsistenciaService } from '../../services/asistencia.service';
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

  // DATOS
  niveles: any[] = [];
  todasLasSecciones: any[] = [];
  seccionesFiltradas: any[] = [];
  asistencias: any[] = [];

  // FILTROS
  nivelSeleccionado: number | null = null;
  seccionSeleccionada: number | null = null;
  fechaSeleccionada: string = new Date().toISOString().split('T')[0];

  cargando: boolean = false;
  busquedaRealizada: boolean = false;

  // MODAL EDITAR / JUSTIFICAR
  mostrarModal: boolean = false;
  asistenciaEditar: any = null;
  nuevaSituacion: string = '';

  listaSituaciones: string[] = ['PUNTUAL', 'TARDE', 'FALTA', 'FALTA JUSTIFICADA', 'TARDANZA JUSTIFICADA'];

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
      next: (res: any) => {
        this.niveles = res.data || res;
        this.seccionService.obtenerSecciones().subscribe({
          next: (resSec: any) => {
            this.todasLasSecciones = resSec.data || resSec;
            if (this.niveles.length > 0) {
              this.nivelSeleccionado = this.niveles[0].id;
              this.filtrarSecciones();
              if (this.seccionesFiltradas.length > 0) {
                this.seccionSeleccionada = this.seccionesFiltradas[0].id;
                this.buscarAsistencias();
              }
            }
            this.cargando = false;
          }, error: () => this.cargando = false
        });
      }, error: () => this.cargando = false
    });
  }

  onNivelChange() {
    this.seccionSeleccionada = null;
    this.filtrarSecciones();
    if (this.seccionesFiltradas.length > 0) this.seccionSeleccionada = this.seccionesFiltradas[0].id;
  }

  filtrarSecciones() {
    if (!this.nivelSeleccionado) { this.seccionesFiltradas = []; return; }
    this.seccionesFiltradas = this.todasLasSecciones.filter(s => s.nivel_id == this.nivelSeleccionado);
  }

  buscarAsistencias() {
    if (!this.nivelSeleccionado || !this.seccionSeleccionada || !this.fechaSeleccionada) return;
    this.cargando = true;
    this.busquedaRealizada = true;

    this.asistenciaService.obtenerAsistenciasPorAula(this.nivelSeleccionado, this.seccionSeleccionada, this.fechaSeleccionada)
      .subscribe({
        next: (res: any) => {
          this.asistencias = res.data || [];
          this.cargando = false;
        },
        error: () => { this.asistencias = []; this.cargando = false; }
      });
  }

  // --- LÓGICA DEL MODAL ---
  abrirModalEditar(item: any) {
    this.asistenciaEditar = item;
    this.nuevaSituacion = item.situacion;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.asistenciaEditar = null;
  }

  guardarCambio() {
    if (!this.asistenciaEditar || !this.nuevaSituacion) return;

    const datos = {
      alumno_id: this.asistenciaEditar.alumno_id,
      fecha: this.fechaSeleccionada,
      situacion: this.nuevaSituacion
    };

    this.cargando = true;
    this.asistenciaService.justificarFalta(datos).subscribe({
      next: (res) => {
        alert(res.mensaje);
        this.cerrarModal();
        this.buscarAsistencias(); // Recargar la tabla
      },
      error: () => {
        alert('Error al guardar cambio');
        this.cargando = false;
      }
    });
  }

  exportarPDF() {
    if (this.asistencias.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text('Reporte de Asistencia', 14, 20);
    doc.setFontSize(10); doc.text(`Fecha: ${this.fechaSeleccionada}`, 14, 30);
    const seccion = this.seccionesFiltradas.find(s => s.id == this.seccionSeleccionada);
    if (seccion) doc.text(`Aula: ${seccion.nombre}`, 14, 36);

    const data = this.asistencias.map((item, i) => [
      i + 1, `${item.apellidos}, ${item.nombres}`, item.dni_ce, item.hora_entrada, item.situacion
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['#', 'Alumno', 'DNI', 'Hora', 'Estado']],
      body: data,
      theme: 'grid',
      headStyles: { fillColor: [13, 71, 161] },
      didParseCell: (d) => {
        if (d.section === 'body' && d.column.index === 4) {
          const est = String(d.cell.raw);
          if (est.includes('FALTA')) d.cell.styles.textColor = [220, 53, 69];
          else if (est.includes('TARDE')) d.cell.styles.textColor = [255, 193, 7];
          else d.cell.styles.textColor = [25, 135, 84];
        }
      }
    });
    doc.save(`asistencia_${this.fechaSeleccionada}.pdf`);
  }
}