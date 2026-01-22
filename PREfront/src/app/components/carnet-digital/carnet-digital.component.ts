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

    // Buscamos el elemento HTML por su ID (Asegúrate de tener id="carnetImprimir" en tu HTML)
    const data = document.getElementById('carnetImprimir');

    if (data) {
      // html2canvas toma una "captura" del div
      html2canvas(data, {
        scale: 3, // Aumentamos la escala para mejor calidad de impresión (evita QR borroso)
        useCORS: true // Permite cargar imágenes externas si las hubiera
      }).then(canvas => {

        // Configuramos las dimensiones
        const imgWidth = 85; // Ancho estándar tarjeta (mm)
        const pageHeight = 297; // Altura A4 (mm)
        const pageWidth = 210;  // Ancho A4 (mm)

        // Calculamos la altura proporcional de la imagen basada en el canvas
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Posición para centrar en la hoja A4
        const positionX = (pageWidth - imgWidth) / 2;
        const positionY = 20; // Margen superior

        const contentDataURL = canvas.toDataURL('image/png');

        // Creamos el PDF (orientación vertical 'p', unidad 'mm', formato 'a4')
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Agregamos la imagen al PDF
        pdf.addImage(contentDataURL, 'PNG', positionX, positionY, imgWidth, imgHeight);

        // Guardamos el archivo con el nombre del alumno
        const nombreArchivo = `Carnet_${this.alumno.nombres || 'Nombres'}_${this.alumno.apellidos || 'Apellidos'}.pdf`;
        pdf.save(nombreArchivo);

        this.generandoPDF = false; // Terminar estado de carga
      }).catch(err => {
        console.error("Error al generar PDF", err);
        this.generandoPDF = false;
      });
    } else {
      console.error("No se encontró el elemento HTML con id 'carnetImprimir'");
      this.generandoPDF = false;
    }
  }
}