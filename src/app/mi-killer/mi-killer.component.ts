import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogComponent } from '../dialog/dialog.component';
import { BrinderService } from '../shared/services/brinder.service';
import { BuzonService } from '../shared/services/buzon.service';
import { Utils } from '../shared/utils';
import { BuzonBaseComponent } from '../buzon-personal/buzon-base/buzon-base.component';

@Component({
  selector: 'app-mi-killer',
  templateUrl: './mi-killer.component.html',
  styleUrls: ['./mi-killer.component.scss'],
})
export class MiKillerComponent extends BuzonBaseComponent {
  utils: Utils;
  medallas: any[] = [];
  tipo: string = 'brinder';
  seccionActiva: string = 'estado';
  colorSeleccionado: string = '#ffffff'; // Valor inicial en hexadecimal
  tipoConexion: string = 'romantico'; // Valor inicial
  personajes: any[] = [];
  asignado: boolean = false;
  equipo: string = '';
  mostrandoCuentaAtras: boolean = false;
  cuentaAtras: number = 5;

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
      if (seccion === 'estado' || seccion === 'mi-equipo' || seccion === 'inventario') {
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

    this.brinderService.getEquipoAsignado('1', this.id!).subscribe({
      next: (res) => {
        this.asignado = res.asignado;
        this.equipo = res.equipo || '';
      },
      error: (err) => {
        console.error('Error al comprobar equipo:', err);
      },
    });

    console.log('ID del personaje:', this.id);
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

  confirmarUnirse() {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: 'Confirmar',
        message:
          '¿Estás seguro de que deseas unirte a un equipo?',
        showCancel: true,
      },
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado === "true") {
        this.unirseEquipo();
      }
    });
  }

  unirseEquipo() {
    this.mostrandoCuentaAtras = true;
    this.cuentaAtras = 5;

    const intervalo = setInterval(() => {
      this.cuentaAtras--;
      if (this.cuentaAtras === 0) {
        clearInterval(intervalo);
        this.brinderService.asignarEquipo(this.personaje.id, '1').subscribe({
          next: (res) => {
            this.asignado = true;
            this.equipo = res.equipo || '';
            this.mostrandoCuentaAtras = false;
          },
          error: (err) => {
            console.error('Error al asignar equipo:', err);
            this.mostrandoCuentaAtras = false;
          },
        });
      }
    }, 1000);
  }
}
