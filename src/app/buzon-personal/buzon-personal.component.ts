import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BuzonBaseComponent } from './buzon-base/buzon-base.component';
import { BuzonService } from '../shared/services/buzon.service';
import { Utils } from '../shared/utils';
import { DialogComponent } from '../dialog/dialog.component';
import { BrinderService } from '../shared/services/brinder.service';
import { CodigoDialogComponent } from '../dialog/codigo-dialog/codigo-dialog.component';

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
    { icono: '⚔️', descripcion: 'Espadas' },
    { icono: '🛡️', descripcion: 'Escudo' },
    { icono: '👑', descripcion: 'Corona' },
    { icono: '🏰', descripcion: 'Castillo' },
    { icono: '❤️', descripcion: 'Corazón' },
    { icono: '💝', descripcion: 'Regalo' },
    { icono: '💕', descripcion: 'Corazones' },
    { icono: '💖', descripcion: 'Corazón brillante' },
    { icono: '💫', descripcion: 'Estrella fugaz' },
    { icono: '✨', descripcion: 'Brillo' },
    { icono: '🌟', descripcion: 'Estrella' },
    { icono: '💌', descripcion: 'Carta' },
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

  getBordeClase(character: any): string {
    switch (character.info_user) {
      case 'romantico':
        return 'borde-rojo';
      case 'amistad':
        return 'borde-azul';
      case 'surja':
        return 'borde-verde';
      case 'tipo4':
        return 'borde-amarillo';
      default:
        return 'borde-generico';
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

  navegar(ruta: string) {
    this.utils.navegar(ruta);
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
