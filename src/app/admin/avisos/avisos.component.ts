import { Component } from '@angular/core';
import { BrinderService } from '../../shared/services/brinder.service';
import { DialogComponent } from '../../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Utils } from '../../shared/utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-avisos',
  templateUrl: './avisos.component.html',
  styleUrls: ['./avisos.component.scss'],
})
export class AvisosComponent {
  aviso = { prioridad: '', mensaje: '', tipo: 'brinder' };
  utils: Utils;

  constructor(
    private brinderService: BrinderService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.utils = new Utils(this.router);
  }

  enviarMensaje(): void {
    this.brinderService.enviarAviso(this.aviso).subscribe(() => {
      const dialogRef = this.openDialog(
        'Aviso enviado',
        'Estará disponible en la sección de avisos'
      );
      this.aviso = { prioridad: '', mensaje: '', tipo: 'brinder' };
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
