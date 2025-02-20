import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BrinderService } from 'src/app/shared/services/brinder.service';
import { Utils } from 'src/app/shared/utils';

@Component({
  selector: 'app-lista-contacto',
  templateUrl: './lista-contacto.component.html',
  styleUrls: ['./lista-contacto.component.scss'],
})
export class ListaContactoComponent implements OnInit {
  mensajes: any[] = [];
  tipo: string = 'brinder';
  utils: Utils;

  constructor(
    protected brinderService: BrinderService,
    protected router: Router,
    protected dialog: MatDialog
  ) {
    this.utils = new Utils(this.router);
  }

  ngOnInit(): void {
    this.cargarMensajesContacto();
  }

  cargarMensajesContacto(): void {
    this.brinderService.listarMensajesContacto(this.tipo).subscribe((data) => {
      this.mensajes = data.map((msg) => ({ ...msg, expandido: false }));
    });
  }

  toggleMensaje(mensaje: any): void {
    mensaje.expandido = !mensaje.expandido;
  }

  navegar(ruta: string) {
    this.utils.navegar(ruta);
  }
}
