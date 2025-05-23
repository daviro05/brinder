import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BuzonBaseComponent } from './buzon-base/buzon-base.component';
import { BuzonService } from '../shared/services/buzon.service';
import { Utils } from '../shared/utils';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-buzon-personal',
  templateUrl: './buzon-personal.component.html',
  styleUrls: ['./buzon-personal.component.scss'],
})
export class BuzonPersonalComponent extends BuzonBaseComponent {
  personajes: any[] = [];
  buzon = {
    codigo_origen: '',
    codigo_destino: '',
    mensaje: '',
    tipo: 'brinder',
  };
  utils: Utils;

  emoticonos = [
    { icono: '🏛️', descripcion: 'Templo romano' },
    { icono: '🦅', descripcion: 'Águila romana' },
    { icono: '🏺', descripcion: 'Ánfora' },
    { icono: '🍇', descripcion: 'Uvas' },
    { icono: '❤️', descripcion: 'Corazón' },
    { icono: '💘', descripcion: 'Flecha de Cupido' },
    { icono: '🕊️', descripcion: 'Paloma' },
    { icono: '🌹', descripcion: 'Rosa' },
    { icono: '💋', descripcion: 'Beso' },
    { icono: '✨', descripcion: 'Brillo' },
    { icono: '🏆', descripcion: 'Trofeo' },
    { icono: '📜', descripcion: 'Pergamino' },
  ];

  constructor(
    protected override buzonService: BuzonService,
    protected override router: Router,
    protected override dialog: MatDialog
  ) {
    super(buzonService, router, dialog);
    this.utils = new Utils(this.router);
  }

  onCodigoValidado(): void {
    this.buzon.codigo_origen = this.codigo!;
    this.buzonService.obtenerPersonajes().subscribe((data) => {
      this.personajes = data;
      this.personajes = this.personajes.filter(
        (personaje) => personaje.activo === 'activo'
      );
    });
  }

  enviarMensaje(): void {
    if (this.buzon.codigo_destino && this.buzon.mensaje) {
      this.buzonService.enviarMensaje(this.buzon).subscribe(() => {
        this.openDialog(
          'Mensaje enviado',
          'Tu mensaje anónimo se ha enviado correctamente.'
        );
        this.buzon.mensaje = '';
        this.buzon.codigo_destino = '';
      });
    }
  }


  openDialog(title: string, message: string): void {
    this.dialog.open(DialogComponent, {
      data: {
        title: title,
        message: message,
      },
    });
  }


  insertarEmoticono(emoticono: string): void {
    const textarea = document.getElementById('mensaje') as HTMLTextAreaElement;
    if (textarea) {
      const inicio = textarea.selectionStart;
      const fin = textarea.selectionEnd;
      const texto = this.buzon.mensaje;
      this.buzon.mensaje =
        texto.substring(0, inicio) + emoticono + texto.substring(fin);

      // Hacemos el textarea temporalmente readonly para evitar que se abra el teclado
      textarea.setAttribute('readonly', 'true');

      // Restaurar el foco y la posición del cursor después del emoticono insertado
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          inicio + emoticono.length,
          inicio + emoticono.length
        );
        // Quitamos el readonly después de un momento
        setTimeout(() => {
          textarea.removeAttribute('readonly');
        }, 100);
      });
    }
  }
}
