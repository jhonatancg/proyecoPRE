import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxQrcodeStylingComponent, Options } from 'ngx-qrcode-styling';

@Component({
  selector: 'app-carnet-digital',
  standalone: true,
  imports: [CommonModule, NgxQrcodeStylingComponent],
  templateUrl: './carnet-digital.component.html',
  styleUrls: ['./carnet-digital.component.css']
})
export class CarnetDigitalComponent implements OnChanges {
  @Input() alumno: any = null;

  // 1. Configuración INICIAL (Se crea una sola vez para no congelar la memoria)
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

  // 2. Detectamos cambios: Solo actualizamos la data si llega un nuevo alumno
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['alumno'] && this.alumno) {

      // Actualizamos la configuración existente
      this.config = {
        ...this.config,
        data: this.alumno.dni_ce || this.alumno.dni || 'SIN-DNI'
      };

    }
  }

  imprimirCarnet() {
    window.print();
  }
}