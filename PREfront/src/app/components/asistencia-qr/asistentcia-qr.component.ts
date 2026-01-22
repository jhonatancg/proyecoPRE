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
  mensaje = 'Iniciando cámara...';
  tipoMensaje: 'info' | 'success' | 'error' = 'info';

  procesando = false;
  cameraActiva = false;

  cameras: MediaDeviceInfo[] = [];
  deviceSelected: MediaDeviceInfo | null = null;

  constructor(
    private asistenciaService: AsistenciaService,
    private router: Router
  ) {
    // Apagar cámara si el usuario cambia de ruta (navega atrás/adelante)
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => this.apagarCamara());
  }

  async ngAfterViewInit(): Promise<void> {
    try {
      // 1. Pedir permisos al navegador primero
      await navigator.mediaDevices.getUserMedia({ video: true });

      // 2. Listar dispositivos nativamente
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.cameras = devices.filter(d => d.kind === 'videoinput');

      if (!this.cameras.length) {
        this.mensaje = 'No se encontró ninguna cámara';
        this.tipoMensaje = 'error';
        return;
      }

      // 3. Buscar cámara trasera (palabras clave comunes)
      const backCamera = this.cameras.find(d =>
        d.label.toLowerCase().includes('back') ||
        d.label.toLowerCase().includes('environment') ||
        d.label.toLowerCase().includes('trasera')
      );

      // 4. Seleccionar la trasera o la primera disponible por defecto
      this.deviceSelected = backCamera || this.cameras[0];

      // 5. INICIAR CÁMARA
      this.cameraActiva = true;
      this.mensaje = 'Escanea el QR del alumno';

      // Inicializamos el componente scanner
      this.action.start();

      // Forzamos el uso del dispositivo seleccionado usando su ID
      if (this.deviceSelected) {
        this.action.playDevice(this.deviceSelected.deviceId);
      }

    } catch (err) {
      console.error(err);
      this.mensaje = 'Error: Permiso de cámara denegado';
      this.tipoMensaje = 'error';
      this.cameraActiva = false;
    }
  }

  ngOnDestroy(): void {
    this.action.stop();
  }

  onEvent(e: any): void {
    if (!this.cameraActiva || this.procesando) return;

    if (e && e.length > 0 && e[0].value) {
      const codigoQR = e[0].value;
      this.procesarAsistencia(codigoQR);
    }
  }

  procesarAsistencia(dni: string): void {
    this.procesando = true;
    this.mensaje = 'Procesando...';

    // Pausar visualmente (congela la imagen para dar feedback)
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

      this.action.start();

      if (this.deviceSelected) {
        this.action.playDevice(this.deviceSelected.deviceId);
      }
    }
  }

  apagarCamara() {
    this.action.stop();
    this.cameraActiva = false;
    this.mensaje = 'Cámara apagada';
    this.tipoMensaje = 'info';
  }

  salir() {
    this.apagarCamara();
    this.router.navigate(['/']);
  }

  cambiarCamara() {
    if (this.cameras.length <= 1) return;


    this.action.pause();

    // Calcular siguiente índice
    const currentIdx = this.cameras.findIndex(c => c.deviceId === this.deviceSelected?.deviceId);
    const nextIdx = (currentIdx + 1) % this.cameras.length;

    this.deviceSelected = this.cameras[nextIdx];
    this.mensaje = `Cambiando cámara...`;

    // Pequeño timeout para evitar conflictos de hardware
    setTimeout(() => {
      if (this.deviceSelected) {
        this.action.playDevice(this.deviceSelected.deviceId);
        this.mensaje = `Cámara: ${this.deviceSelected.label}`;

        // Asegurar que si estaba pausado por el cambio, vuelva a play
        this.action.play();
      }
    }, 300);
  }

  playSound(type: 'success' | 'error') {
    const audio = new Audio();
    audio.src = type === 'success' ? 'assets/beep-success.mp3' : 'assets/beep-error.mp3';
    audio.load();
    audio.play().catch(() => { });
  }
}