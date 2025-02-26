import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { BrinderModel } from 'src/app/shared/brinder.model';
import { BrinderService } from 'src/app/shared/services/brinder.service';
import { Utils } from 'src/app/shared/utils';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-editar-personaje',
  templateUrl: './editar-personaje.component.html',
  styleUrls: ['./editar-personaje.component.scss'],
})
export class EditarPersonajeComponent {
  personaje!: BrinderModel;
  texto: string = '';
  utils: Utils;

  constructor(
    private route: ActivatedRoute,
    private brinderService: BrinderService,
    private router: Router,
    private dialog: MatDialog,
    private clipboard: Clipboard
  ) {
    this.utils = new Utils(this.router);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.brinderService.obtenerPersonaje(id).subscribe((data) => {
        this.personaje = data[0]; // Suponiendo que el backend devuelve un array con un solo objeto
      });
    }
  }

toggleActivo(event: MatCheckboxChange): void {
  const checked = event.checked;
  this.personaje.activo = checked ? 'activo' : 'inactivo';
}


  guardarCambios(): void {
    if (this.personaje.id) {
      this.brinderService
        .updatePersonaje(this.personaje.id, this.personaje)
        .subscribe(
          () => {
            const dialogRef = this.openDialog(
              'Edición correcta',
              'Personaje editado con éxito'
            );
            dialogRef.afterClosed().subscribe(() => {
              this.navegar('admin');
            });
          },
          (error) => {
            console.error('Error al editar al personaje:', error);
            this.openDialog(
              'Error',
              'Hubo un error al editar al personaje. Contacta con el Centurión.'
            );
          }
        );
    }
  }

  openDialog(title: string, message: string) {
    return this.dialog.open(DialogComponent, {
      data: {
        title: title,
        message: message,
      },
    });
  }

  copiarAlPortapapeles(): void {
    this.clipboard.copy(this.personaje.codigo);
    //alert('Código copiado al portapapeles');
  }

  getGoogleDriveImageUrl(url: string): string {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return url; // Devuelve la misma caena si no cumple el formato
  }

  navegar(ruta: string) {
    this.utils.navegar(ruta);
  }
}
