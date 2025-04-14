import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BrinderService } from 'src/app/shared/services/brinder.service';
import { BuzonService } from 'src/app/shared/services/buzon.service';
import { Utils } from 'src/app/shared/utils';

@Component({
  selector: 'app-lista-buzon-admin',
  templateUrl: './lista-buzon-admin.component.html',
  styleUrls: ['./lista-buzon-admin.component.scss'],
})
export class ListaBuzonAdminComponent {
  mensajes: any[] = [];
  utils: Utils;
  tipo: string = 'brinder';

  constructor(
    protected brinderService: BrinderService,
    protected router: Router,
    protected dialog: MatDialog
  ) {
    this.utils = new Utils(this.router);
  }

  ngOnInit(): void {
    this.cargarMensajesBuzon();
  }

  cargarMensajesBuzon(): void {
    this.brinderService.listarMensajesBuzon(this.tipo).subscribe((data) => {
      //console.log(data)
      this.mensajes = data.map((msg) => ({ ...msg, expandido: false }));
    });
  }

  toggleMensaje(mensaje: any): void {
    mensaje.expandido = !mensaje.expandido;
  }
}
