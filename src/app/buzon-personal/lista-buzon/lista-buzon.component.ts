import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BuzonService } from '../../shared/services/buzon.service';
import { BuzonBaseComponent } from '../buzon-base/buzon-base.component';
import { Utils } from 'src/app/shared/utils';
import { CodigoDialogComponent } from 'src/app/dialog/codigo-dialog/codigo-dialog.component';
import { BrinderService } from 'src/app/shared/services/brinder.service';
import { DialogComponent } from 'src/app/dialog/dialog.component';

@Component({
  selector: 'app-lista-buzon',
  templateUrl: './lista-buzon.component.html',
  styleUrls: ['./lista-buzon.component.scss'],
})
export class ListaBuzonComponent extends BuzonBaseComponent implements OnInit {
  mensajes: any[] = [];
  utils: Utils;
  nuevoAlias: string = '';

  constructor(
    protected override buzonService: BuzonService,
    protected override router: Router,
    protected override dialog: MatDialog,
    protected brinderService: BrinderService
  ) {
    super(buzonService, router, dialog);
    this.utils = new Utils(this.router);
  }

  OnInit(): void {
  
  }

  onCodigoValidado(): void {
    this.buzonService.obtenerMensajes(this.codigo!).subscribe((mensajes) => {
      this.mensajes = mensajes.map((msg) => ({ ...msg, expandido: false }));
    });
  }

  toggleMensaje(mensaje: any): void {
    mensaje.expandido = !mensaje.expandido;
  }

  abrirDialogoAlias(): void {
    const dialogRef = this.dialog.open(CodigoDialogComponent, {
      data: { tipo: 'alias', valorActual: '' },
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado?.valor && resultado.valor.trim()) {
        this.actualizarAlias(resultado.valor);
      }
    });
  }

  actualizarAlias(nuevoAlias: string): void {

    //console.log(this.codigo!, nuevoAlias)
    this.brinderService
      .actualizarAlias(this.codigo!, nuevoAlias)
      .subscribe({
        next: () => {
          this.openDialog('Éxito', 'Tu código se ha actualizado correctamente.');
          //this.nombrePersonaje = nuevoAlias;
        },
        error: () => {
          this.openDialog(
            'Error',
            'No se pudo actualizar el código. Inténtalo de nuevo.'
          );
        },
      });
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
}
