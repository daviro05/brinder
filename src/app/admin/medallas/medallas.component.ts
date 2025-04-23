import { Component } from '@angular/core';
import { BrinderService } from '../../shared/services/brinder.service';
import { DialogComponent } from '../../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Utils } from '../../shared/utils';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-medallas-admin',
  templateUrl: './medallas.component.html',
  styleUrls: ['./medallas.component.scss'],
})
export class MedallasAdminComponent {
  medalla = { nombre: '', descripcion: '', icono_url: '' };
  medallas: any[] = [];
  medallasSeleccionadas: any[] = [];
  seccionActiva: string = 'crear-medallas';
  utils: Utils;

  constructor(
    private brinderService: BrinderService,
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute // Agregado para leer parámetros de la URL
  ) {
    this.utils = new Utils(this.router);

    // Leer parámetros de la URL y establecer la sección activa
    this.route.queryParams.subscribe((params) => {
      const seccion = params['seccion'];
      if (seccion === 'crear-medallas' || seccion === 'eliminar-medallas') {
        this.seccionActiva = seccion;
      }
    });

    this.brinderService.obtenerAllMedallas().subscribe((data) => {
      this.medallas = data;
    });
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

  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;
    this.router.navigate([], {
      queryParams: { seccion },
      queryParamsHandling: 'merge',
    });
    this.brinderService.obtenerAllMedallas().subscribe((data) => {
      this.medallas = data;
    });
  }

  eliminarMedalla(): void {
    if (!this.medallasSeleccionadas.length) {
      this.openDialog(
        'Error',
        'No has seleccionado ninguna medalla para eliminar.'
      );
      return;
    }

    const eliminaciones = this.medallasSeleccionadas.map((medallaId) =>
      this.brinderService.eliminarMedalla(medallaId).toPromise()
    );

    Promise.all(eliminaciones)
      .then(() => {
        this.openDialog(
          'Éxito',
          'Las medallas seleccionadas han sido eliminadas correctamente.'
        );
        this.medallasSeleccionadas = [];
        this.cambiarSeccion('eliminar-medallas'); // Actualiza la lista de medallas
      })
      .catch((error) => {
        console.error('Error al eliminar las medallas:', error);
        this.openDialog(
          'Error',
          'Hubo un error al eliminar las medallas seleccionadas.'
        );
      });
  }
}
