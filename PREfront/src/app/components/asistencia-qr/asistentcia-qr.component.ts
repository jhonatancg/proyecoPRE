import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ViewChild,
  OnDestroy
} from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';

import { AsistenciaService } from '../../services/asistencia.service';
import { NgxScannerQrcodeComponent } from 'ngx-scanner-qrcode';
import { AsistenciaResponse } from '../../models/asistencia.interface';

@Component({
  selector: 'app-asistentia-qr',
  standalone: true,
  imports: [CommonModule, NgxScannerQrcodeComponent],
  templateUrl: './asistencia-qr.component.html',
  styleUrl: './asistencia-qr.component.css'
})
export class AsistentiaQrComponent implements AfterViewInit, OnDestroy {

  @ViewChild('action') action!: NgxScannerQrcodeComponent;

  ultimosRegistros: any[] = [];
  mensaje = 'Escanea el QR del alumno';
  tipoMensaje: 'info' | 'success' | 'error' = 'info';
  procesando = false;

  cameraActiva = true;

  constructor(
    private asistenciaService: AsistenciaService,
    private router: Router
  ) {
    // 🔴 Apagar cámara cuando cambia la ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => {
        this.apagarCamara();
      });
  }

  ngAfterViewInit(): void {
    this.action.start();
  }

  ngOnDestroy(): void {
    this.apagarCamara();
  }

  onEvent(e: any): void {
    if (!this.cameraActiva || this.procesando) return;

    if (e && e.length > 0) {
      const codigoQR = e[0].value;
      this.procesarAsistencia(codigoQR);
    }
  }

  procesarAsistencia(dni: string): void {
    this.procesando = true;
    this.mensaje = 'Procesando...';

    this.action.pause();

    this.asistenciaService.registrarAsistencia(dni).subscribe({
      next: (res: AsistenciaResponse) => {

        if (!res.data) {
          this.mensaje = res.mensaje;
          this.tipoMensaje = 'error';
          this.resetScanner();
          return;
        }

        this.mensaje = res.mensaje;
        this.tipoMensaje = 'success';
        this.playSound('success');

        this.ultimosRegistros.unshift({
          alumno: res.data.alumno,
          hora: res.data.hora,
          situacion: res.data.situacion
        });

        setTimeout(() => this.resetScanner(), 2000);
      },
      error: (err) => {
        this.playSound('error');
        this.mensaje = err.error?.mensaje || 'Error al registrar';
        this.tipoMensaje = 'error';

        setTimeout(() => this.resetScanner(), 3000);
      }
    });
  }

  resetScanner() {
    this.procesando = false;
    this.tipoMensaje = 'info';

    if (this.cameraActiva) {
      this.mensaje = 'Escanea el QR del alumno';
      this.action.play();
    }
  }

  toggleCamera() {
    if (this.cameraActiva) {
      this.apagarCamara();
    } else {
      this.cameraActiva = true;
      this.mensaje = 'Escanea el QR del alumno';
      this.tipoMensaje = 'info';
      this.action.play();
    }
  }

  apagarCamara() {
    if (!this.action) return;

    this.action.pause();
    this.cameraActiva = false;
    this.mensaje = 'Cámara apagada';
    this.tipoMensaje = 'info';
  }

  salir() {
    this.apagarCamara();
    this.router.navigate(['/']);
  }

  playSound(type: 'success' | 'error') {
    const audio = new Audio();
    audio.src =
      type === 'success'
        ? 'assets/beep-success.mp3'
        : 'assets/beep-error.mp3';
    audio.load();
    audio.play().catch(() => { });
  }
}
