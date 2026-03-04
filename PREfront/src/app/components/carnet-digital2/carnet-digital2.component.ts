import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxQrcodeStylingComponent, Options } from 'ngx-qrcode-styling';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-carnet-digital2',
  standalone: true,
  imports: [CommonModule, NgxQrcodeStylingComponent],
  templateUrl: './carnet-digital2.component.html',
  styleUrls: ['./carnet-digital2.component.css']
})
export class CarnetDigital2Component implements OnChanges {
  @Input() alumno: any = null;
  @Input() ocultarAcciones: boolean = false;

  generandoPDF: boolean = false;

  public config: Options = {
    width: 140,
    height: 140,
    data: 'ESPERANDO DATOS',
    margin: 0,
    dotsOptions: { color: '#0d47a1', type: 'rounded' },
    backgroundOptions: { color: '#ffffff' },
    cornersSquareOptions: { color: '#1565c0', type: 'extra-rounded' }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['alumno'] && this.alumno) {
      this.config = {
        ...this.config,
        data: this.alumno.dni_ce || this.alumno.dni || 'SIN-DNI'
      };
    }
  }

  imprimirCarnet() {
    this.generandoPDF = true;

    const data = document.getElementById('carnetImprimir2');

    if (data) {
      html2canvas(data, {
        scale: 4,
        useCORS: true,
        backgroundColor: null
      }).then(canvas => {

        // --- MEDIDAS EXACTAS (15 cm x 6.0 cm) ---
        const imgWidth = 146;
        const imgHeight = 60;

        const pdf = new jsPDF('p', 'mm', 'a4');

        const positionX = 30;
        const positionY = 20;

        const contentDataURL = canvas.toDataURL('image/jpeg', 0.95);

        pdf.addImage(contentDataURL, 'JPEG', positionX, positionY, imgWidth, imgHeight);

        const nombreArchivo = `Carnet_${this.alumno.nombres || 'Alumno'}.pdf`;
        pdf.save(nombreArchivo);

        this.generandoPDF = false;
      }).catch(err => {
        console.error("Error al generar PDF", err);
        this.generandoPDF = false;
      });
    } else {
      console.error("No se encontró el ID 'carnetImprimir2'");
      this.generandoPDF = false;
    }
  }
}