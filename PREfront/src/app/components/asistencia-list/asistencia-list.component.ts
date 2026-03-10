import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NivelService } from '../../services/nivel.service';
import { SeccionService } from '../../services/seccion.service';
import { AsistenciaService } from '../../services/asistencia.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// --- IMPORTAMOS LOS COMPONENTES DE CARNETS ---
import { CarnetDigitalComponent } from '../carnet-digital/carnet-digital.component';
import { CarnetDigital2Component } from '../carnet-digital2/carnet-digital2.component';

@Component({
  selector: 'app-asistencia-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CarnetDigitalComponent, CarnetDigital2Component],
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

  // --- VARIABLES PARA LOS CARNETS ---
  alumnoSeleccionadoCarnet1: any = null;
  alumnoSeleccionadoCarnet2: any = null;

  // --- ESTADOS DE DESCARGA MASIVA ---
  generandoMasivo1: boolean = false;
  generandoMasivo2: boolean = false;
  progresoMasivo: string = '';

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
        this.buscarAsistencias();
      },
      error: () => {
        alert('Error al guardar cambio');
        this.cargando = false;
      }
    });
  }

  prepararAlumnoParaCarnet(item: any) {
    const nivelObj = this.niveles.find(n => n.id == this.nivelSeleccionado);
    const seccionObj = this.seccionesFiltradas.find(s => s.id == this.seccionSeleccionada);

    return {
      ...item,
      nivel: nivelObj ? nivelObj.nombre : 'PRE',
      seccion: seccionObj ? seccionObj.nombre : 'A'
    };
  }

  verCarnet1(item: any) {
    this.alumnoSeleccionadoCarnet1 = this.prepararAlumnoParaCarnet(item);
  }

  cerrarCarnet1() {
    this.alumnoSeleccionadoCarnet1 = null;
  }

  verCarnet2(item: any) {
    this.alumnoSeleccionadoCarnet2 = this.prepararAlumnoParaCarnet(item);
  }

  cerrarCarnet2() {
    this.alumnoSeleccionadoCarnet2 = null;
  }

  async descargarCarnets1() {
    if (this.asistencias.length === 0) return;

    this.generandoMasivo1 = true;
    this.progresoMasivo = 'Iniciando Carnets 1...';

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

    const container = document.getElementById('contenedor-carnets-masivos1');
    if (!container) { this.generandoMasivo1 = false; return; }

    await this.procesarPDF(pdf, container, posiciones, cardWidth, cardHeight, 10, 'Carnets_Aula_Modelo1.pdf');
    this.generandoMasivo1 = false;
  }


  async descargarCarnets2() {
    if (this.asistencias.length === 0) return;

    this.generandoMasivo2 = true;
    this.progresoMasivo = 'Iniciando Carnets 2...';

    const pdf = new jsPDF('l', 'mm', 'a4');

    // Medidas actualizadas a 14.6 cm x 3 cm
    const cardWidth = 146;
    const cardHeight = 30;

    const startX = 2.5;
    const startY = 10;
    const gapX = 0;
    const gapY = 3; // Espacio vertical reducido a 3mm para que quepan las 6 filas

    const posiciones = [];
    // Cambiamos a 6 filas (6 filas x 2 columnas = 12 carnets)
    for (let fila = 0; fila < 6; fila++) {
      for (let col = 0; col < 2; col++) {
        posiciones.push([
          startX + col * (cardWidth + gapX),
          startY + fila * (cardHeight + gapY)
        ]);
      }
    }

    const container = document.getElementById('contenedor-carnets-masivos2');
    if (!container) { this.generandoMasivo2 = false; return; }

    // Cambiamos el límite por página a 12
    await this.procesarPDF(pdf, container, posiciones, cardWidth, cardHeight, 12, 'Carnets_Aula_Modelo2.pdf');
    this.generandoMasivo2 = false;
  }

  // FUNCIÓN REUTILIZABLE PARA GENERAR EL PDF MASIVO

  private async procesarPDF(pdf: jsPDF, container: HTMLElement, posiciones: number[][],
    cardWidth: number, cardHeight: number, limitPerPage: number, filename: string) {

    const wrapperDivs = container.children;
    let cardsInPage = 0;

    for (let i = 0; i < this.asistencias.length; i++) {
      this.progresoMasivo = `Procesando ${i + 1} de ${this.asistencias.length}...`;

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

        // Pequeña pausa para que el navegador no se congele
        if (i % 5 === 0) await new Promise(r => setTimeout(r, 20));

      } catch (e) {
        console.error(`Error procesando carnet ${i}`, e);
      }
    }

    this.progresoMasivo = 'Finalizando PDF...';
    pdf.save(filename);
  }

  // --- EXPORTAR PDF REPORTE ASISTENCIA ---
  exportarPDF() {
    if (this.asistencias.length === 0) return;
    const doc = new jsPDF();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(13, 71, 161);
    doc.text('Reporte de Asistencia', 14, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`Fecha: ${this.fechaSeleccionada}`, 14, 32);

    const seccion = this.seccionesFiltradas.find(s => s.id == this.seccionSeleccionada);
    if (seccion) doc.text(`Aula: ${seccion.nombre}`, 14, 38);

    const data = this.asistencias.map((item, i) => [
      i + 1,
      `${item.apellidos}, ${item.nombres}`,
      item.hora_entrada,
      item.situacion
    ]);

    autoTable(doc, {
      startY: 46,
      head: [['#', 'Alumno', 'Hora', 'Estado']],
      body: data,
      theme: 'striped',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 5,
        textColor: [60, 60, 60]
      },
      headStyles: {
        fillColor: [13, 71, 161],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        2: { halign: 'center', cellWidth: 35 },
        3: { halign: 'center', cellWidth: 35, fontStyle: 'bold' }
      },
      didParseCell: (d) => {
        if (d.section === 'body' && d.column.index === 3) {
          const est = String(d.cell.raw).toUpperCase();
          if (est.includes('FALTA')) {
            d.cell.styles.textColor = [220, 53, 69];
          } else if (est.includes('TARDE')) {
            d.cell.styles.textColor = [230, 138, 0];
          } else {
            d.cell.styles.textColor = [25, 135, 84];
          }
        }
      }
    });

    doc.save(`asistencia_${this.fechaSeleccionada}.pdf`);
  }
}