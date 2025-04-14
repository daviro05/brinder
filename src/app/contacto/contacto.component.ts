import { Component } from '@angular/core';
import { BrinderService } from '../shared/services/brinder.service';
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Utils } from '../shared/utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.scss'],
})
export class ContactoComponent {
  contacto = { nombre: '', mensaje: '', tipo: 'brinder' };
  utils: Utils;

  constructor(
    private brinderService: BrinderService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.utils = new Utils(this.router);
  }

  enviarMensaje(): void {
    this.brinderService.enviarContacto(this.contacto).subscribe(() => {
      const dialogRef = this.openDialog(
        'Mensaje enviado',
        'Leeremos tu mensaje lo antes posible'
      );
      this.contacto = { nombre: '', mensaje: '', tipo: 'brinder' };
    });
  }

  openDialog(title: string, message: string) {
    return this.dialog.open(DialogComponent, {
      data: {
        title: title,
        message: message,
      },
    });
  }

}
