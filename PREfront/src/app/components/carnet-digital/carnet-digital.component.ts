import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxQrcodeStylingComponent, Options } from 'ngx-qrcode-styling';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-carnet-digital',
  standalone: true,
  imports: [CommonModule, NgxQrcodeStylingComponent],
  templateUrl: './carnet-digital.component.html',
  styleUrls: ['./carnet-digital.component.css']
})
export class CarnetDigitalComponent implements OnChanges {
  @Input() alumno: any = null;
  @Input() ocultarAcciones: boolean = false;

  generandoPDF: boolean = false;

  // Ajustado para el nuevo tamaño horizontal
  public config: Options = {
    width: 90,
    height: 90,
    data: 'ESPERANDO DATOS',
    margin: 0,
    dotsOptions: {
      color: '#0d47a1',
      type: 'rounded'
    },
    backgroundOptions: {
      color: '#ffffff'
    },
    cornersSquareOptions: {
      color: '#1565c0',
      type: 'extra-rounded'
    }
  };


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['alumno'] && this.alumno) {
      this.config = {
        ...this.config,
        // Seguimos usando el DNI/CE para el QR, ya que eso es lo que el escáner leerá
        data: this.alumno.dni_ce || this.alumno.dni || 'SIN-DNI'
      };
    }
  }

  imprimirCarnet() {
    this.generandoPDF = true;

    const data = document.getElementById('carnetImprimir');

    if (data) {
      html2canvas(data, {
        scale: 4,
        useCORS: true,
        backgroundColor: null
      }).then(canvas => {

        // --- MEDIDAS EXACTAS (9.5 cm x 6.0 cm) ---
        const imgWidth = 95;  // Ancho horizontal
        const imgHeight = 60; // Alto horizontal

        const pdf = new jsPDF('l', 'mm', 'a4');

        const positionX = 15;
        const positionY = 15;

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
      console.error("No se encontró el ID 'carnetImprimir'");
      this.generandoPDF = false;
    }
  }
}