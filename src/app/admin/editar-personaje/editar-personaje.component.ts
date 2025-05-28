import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { BrinderModel } from 'src/app/shared/brinder.model';
import { BrinderService } from 'src/app/shared/services/brinder.service';
import { Utils } from 'src/app/shared/utils';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { EquipoModel } from 'src/app/shared/equipo.model';

@Component({
  selector: 'app-editar-personaje',
  templateUrl: './editar-personaje.component.html',
  styleUrls: ['./editar-personaje.component.scss'],
})
export class EditarPersonajeComponent {
  personaje!: BrinderModel;
  texto: string = '';
  utils: Utils;
  mostrarPassword: boolean = false;
  objetos: any[] = [];
  id: string | undefined;
  equipo!: EquipoModel;

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
      this.misObjetos(id);
      this.obtenerDatosEquipo(id);
    }
  }

  toggleActivo(event: MatCheckboxChange): void {
    const checked = event.checked;
    this.personaje.activo = checked ? 'activo' : 'inactivo';
  }

  guardarCambios(): void {
    if (this.personaje.id) {
      this.personaje.image_url = this.getGoogleDriveImageUrl(
        this.personaje.image_url
      );
      this.brinderService
        .updatePersonaje(this.personaje.id, this.personaje)
        .subscribe(
          () => {
            const dialogRef = this.openDialog(
              'Edición correcta',
              'Personaje editado con éxito'
            );
            dialogRef.afterClosed().subscribe(() => {
              this.utils.navegar('admin');
            });
          },
          (error) => {
            console.error('Error al editar al personaje:', error);
            this.openDialog(
              'Error',
              'Hubo un error al editar al personaje. Inténtalo de nuevo o contacta con el Centurión.'
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

  misObjetos(id: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.brinderService.getMisObjetos(id).subscribe({
        next: (data) => {
          this.objetos = data.filter((objeto: any) => objeto.usado === 0);
          resolve();
        },
        error: (err) => {
          console.error('Error al obtener objetos:', err);
          reject(err);
        },
      });
    });
  }

  obtenerDatosEquipo(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.brinderService.getEquipoAsignado('1', id).subscribe({
        next: (res) => {
          this.equipo = res;
          console.log('Equipo asignado:', this.equipo);
          resolve(res);
        },
        error: (err) => {
          console.error('Error al comprobar equipo:', err);
          reject(err);
        },
      });
    });
  }

}
