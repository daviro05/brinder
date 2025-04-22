import { Component } from '@angular/core';
import { BrinderService } from '../../shared/services/brinder.service';
import { DialogComponent } from '../../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Utils } from '../../shared/utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-medallas-admin',
  templateUrl: './medallas.component.html',
  styleUrls: ['./medallas.component.scss']
})
export class MedallasAdminComponent {

  medalla = { nombre: '', descripcion: '', icono_url: '' };
  utils: Utils;

  constructor(
    private brinderService: BrinderService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.utils = new Utils(this.router);
  }

  crearMedalla(): void {
    this.brinderService.crearMedalla(this.medalla).subscribe(() => {
      const dialogRef = this.openDialog(
        'Medalla creada',
        'Estará disponible en la asignación de medallas'
      );
      this.medalla = { nombre: '', descripcion: '', icono_url: '' };
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
