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


  public config: Options = {
    width: 150,
    height: 150,
    data: 'ESPERANDO DATOS',
    margin: 5,
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
        data: this.alumno.dni_ce || this.alumno.dni || 'SIN-DNI'
      };

    }
  }

  imprimirCarnet() {
    this.generandoPDF = true; // Activar estado de carga

    const data = document.getElementById('carnetImprimir');

    if (data) {
      html2canvas(data, {
        scale: 4, // Alta calidad
        useCORS: true
      }).then(canvas => {

        // --- 1. CONFIGURACIÓN DE MEDIDAS (11cm x 17.5cm) ---
        const imgWidth = 110;  // 110mm (11cm) Ancho
        const imgHeight = 175; // 175mm (17.5cm) Alto

        // --- 2. CONFIGURAR PDF EN HORIZONTAL ('l' = landscape) ---
        const pdf = new jsPDF('l', 'mm', 'a4');

        // --- 3. POSICIÓN "A UN COSTADO" ---
        const positionX = 15; // 15mm desde la izquierda
        const positionY = 15; // 15mm desde arriba

        const contentDataURL = canvas.toDataURL('image/png');

        // Agregamos la imagen con las medidas y posición forzadas
        pdf.addImage(contentDataURL, 'PNG', positionX, positionY, imgWidth, imgHeight);

        // Guardamos el archivo
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