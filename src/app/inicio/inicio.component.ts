import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Utils } from '../shared/utils';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { DialogSimpleComponent } from '../dialog/dialog-simple/dialog-simple.component';
import { BrinderService } from '../shared/services/brinder.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'],
})
export class InicioComponent implements OnInit {
  utils: Utils;

  constructor(
    private router: Router,
    private http: HttpClient,
    private dialog: MatDialog,
    private brinderService: BrinderService
  ) {
    this.utils = new Utils(this.router);
  }

  ngOnInit(): void {
    this.verificarBackend();
  }

  private verificarBackend(): void {
    this.brinderService.statusBackend().subscribe({
      error: () => {
        this.mostrarDialogo();
      },
    });
  }

  private mostrarDialogo(): void {
    this.dialog.open(DialogSimpleComponent, {
      disableClose: true,
      data: {
        titulo: 'Servicio suspendido',
        mensaje:
          'Disculpen las molestias. Estamos trabajando para resolverlo lo antes posible.',
        cerrar: '',
      },
    });
  }

}
