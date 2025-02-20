import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BuzonService } from 'src/app/shared/services/buzon.service';
import { CodigoDialogComponent } from '../../dialog/codigo-dialog/codigo-dialog.component';
import { Component } from '@angular/core';
import { InfoDialogComponent } from 'src/app/info-dialog/info-dialog.component';
import { DialogComponent } from 'src/app/dialog/dialog.component';

@Component({
  selector: 'app-buzon-base',
  templateUrl: './buzon-base.component.html',
  styleUrls: ['./buzon-base.component.css'],
})
export abstract class BuzonBaseComponent implements OnInit {
  nombrePersonaje: string = '';
  aliasPersonaje: string = '';
  codigo!: string | null;

  constructor(
    protected buzonService: BuzonService,
    protected router: Router,
    protected dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.mostrarPanelInformativo();
  }

  solicitarCodigo(): void {
    const codigoGuardado = this.buzonService.solicitarCodigo();
    if (codigoGuardado) {
      this.validarCodigo(codigoGuardado);
      return;
    }

    const dialogRef = this.dialog.open(CodigoDialogComponent, {
      disableClose: true,
      data: { recordar: true, tipo: 'codigo' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      //console.log('The dialog was closed', result, result?.valor);
      if (result && result.valor) {
        this.validarCodigo(result.valor, result.guardar);
      } else {
        this.router.navigate(['/inicio']);
      }
    });
  }

  validarCodigo(codigo: string, guardar?: boolean): void {
    this.buzonService.validarCodigo(codigo, guardar).subscribe({
      next: (data) => {
        this.codigo = data.codigo;
        this.nombrePersonaje = data.nombre;
        this.aliasPersonaje = data.alias;
        this.onCodigoValidado();
      },
      error: () => {
        this.openDialog('Error', 'Código o alias inválido.');
        localStorage.removeItem('codigo_origen');
        this.router.navigate(['/inicio']);
      },
    });
  }

  cerrarBuzon(): void {
    this.buzonService.cerrarBuzon();
    this.router.navigate(['/inicio']);
  }

  mostrarPanelInformativo() {
    if (localStorage.getItem('buzon_noMostrarInfo')) {
      this.solicitarCodigo();
      return;
    }

    this.dialog
      .open(InfoDialogComponent, {
        data: {
          titulo: 'INSTRUCCIONES DEL BUZÓN',
          contenido: `
        <p>Introduce tu código personal.</p>
        <p>Selecciona un personaje de la lista al que quieras escribir un mensaje privado anónimo.</p>
        <p>El destinatario no sabrá quién lo envía.</p>
        <p>Según el color que tenga cada personaje, tendrá los siguientes intereses:</p>
        <ul>
          <li><span class="color-azul">Azul:</span> Amistad</li>
          <li><span class="color-rojo">Rojo:</span> Romántico</li>
          <li><span class="color-verde">Verde:</span> Lo que surja</li>
        </ul>
      `,
          claveLocalStorage: 'buzon_noMostrarInfo',
        },
      })
      .afterClosed()
      .subscribe(() => this.solicitarCodigo());
  }

  abstract onCodigoValidado(): void;

  abstract openDialog(titulo: string, contenido: string): void;
}
