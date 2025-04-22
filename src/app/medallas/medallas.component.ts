import { Component, OnInit } from '@angular/core';
import { BuzonBaseComponent } from '../buzon-personal/buzon-base/buzon-base.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogComponent } from '../dialog/dialog.component';
import { BrinderService } from '../shared/services/brinder.service';
import { BuzonService } from '../shared/services/buzon.service';
import { Utils } from '../shared/utils';

@Component({
  selector: 'app-medallas',
  templateUrl: './medallas.component.html',
  styleUrls: ['./medallas.component.scss'],
})
export class MedallasComponent extends BuzonBaseComponent implements OnInit {
  utils: Utils;
  medallas: any[] = [];
  tipo: string = 'brinder';
  seccionActiva: string = 'mis-medallas';
  colorSeleccionado: string = '#ffffff'; // Valor inicial en hexadecimal
  tipoConexion: string = 'romantico'; // Valor inicial
  medallaForm = {
    personaje_id: '',
    medalla_id: '',
    titulo: '',
  };
  personajes: any[] = [];
  tiposMedalla: any[] = [];
  medallaSeleccionada: any = null;

  constructor(
    protected override buzonService: BuzonService,
    protected override router: Router,
    protected override dialog: MatDialog,
    protected brinderService: BrinderService,
    private route: ActivatedRoute // Agregado para leer parámetros de la URL
  ) {
    super(buzonService, router, dialog);
    this.utils = new Utils(this.router);

    // Leer parámetros de la URL y establecer la sección activa
    this.route.queryParams.subscribe((params) => {
      const seccion = params['seccion'];
      if (seccion === 'estadisticas' || seccion === 'preferencias') {
        this.seccionActiva = seccion;
      }
    });
  }

  onCodigoValidado(): void {
    this.brinderService.obtenerMedallas(this.id!).subscribe((data) => {
      this.medallas = data;
    });

    this.brinderService.obtenerPersonaje(this.id!).subscribe((data) => {
      this.personaje = data[0];
      this.colorSeleccionado = this.utils.obtenerColor(
        this.personaje.info_user
      );
      this.comprobarPerfil(this.personaje.info_user);
      this.personaje.nick = this.personaje.nick || '';
    });

    this.brinderService.obtenerPersonajes('brinder').subscribe((data) => {
      this.personajes = data;
    });

    this.brinderService.tiposMedalla().subscribe((data) => {
      this.tiposMedalla = data;
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

  abrirDialogoMedalla(medalla: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      title: 'Información de la medalla',
      medalla: medalla,
    };
    this.dialog.open(DialogComponent, dialogConfig);
  }

  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;
    this.router.navigate([], {
      queryParams: { seccion },
      queryParamsHandling: 'merge',
    });
    this.brinderService.obtenerMedallas(this.id!).subscribe((data) => {
      this.medallas = data;
    });
  }

  cambioColor(event: any) {
    this.personaje.info_user = event.target.value;
  }

  comprobarPerfil(perfil: string): string {
    const perfilesValidos = ['amistad', 'surja', 'romantico', ''];
    this.tipoConexion = perfilesValidos.includes(perfil) ? perfil : 'otro';
    return this.tipoConexion;
  }

  tipoPerfil(event: any) {
    this.comprobarPerfil(event);
    this.personaje.info_user = this.tipoConexion;
    this.colorSeleccionado = this.utils.obtenerColor(event);
  }

  toggleActivo(event: MatCheckboxChange): void {
    const checked = event.checked;
    this.personaje.activo = checked ? 'activo' : 'inactivo';
  }

  guardarPreferencias() {
    if (this.personaje.rol !== 'medallas') {
      this.openDialog('Error', 'No puedes otorgar medallas');
      return;
    }
    this.brinderService
      .updatePersonaje(this.personaje.id, this.personaje)
      .subscribe(
        () => {
          const dialogRef = this.openDialog(
            'Edición correcta',
            'Preferencias editadas con éxito'
          );
        },
        (error) => {
          console.error('Error al editar las preferencias:', error);
          this.openDialog(
            'Error',
            'Hubo un error al editar las preferencias. Contacta con el Centurión.'
          );
        }
      );
  }

  asignarMedalla(): void {
    if (
      !this.medallaForm.personaje_id ||
      !this.medallaForm.medalla_id ||
      !this.medallaForm.titulo
    ) {
      this.openDialog('Error', 'Todos los campos son obligatorios.');
      return;
    }

    const medalla = {
      personaje_id: this.medallaForm.personaje_id,
      medalla_id: this.medallaForm.medalla_id,
      asignado_por: this.personaje.id,
      titulo: this.medallaForm.titulo,
    };

    this.brinderService.asignarMedalla(medalla).subscribe(
      () => {
        this.openDialog('Éxito', 'Medalla asignada correctamente.');
        this.medallaForm = { personaje_id: '', medalla_id: '', titulo: '' };
      },
      (error) => {
        console.error('Error al asignar la medalla:', error);
        this.openDialog('Error', 'Hubo un error al asignar la medalla.');
      }
    );
  }
}
