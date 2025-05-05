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
import { EquipoModel } from '../shared/equipo.model';

@Component({
  selector: 'app-mi-killer',
  templateUrl: './mi-killer.component.html',
  styleUrls: ['./mi-killer.component.scss'],
})
export class MiKillerComponent extends BuzonBaseComponent {
  utils: Utils;
  medallas: any[] = [];
  tipo: string = 'brinder';
  seccionActiva: string = 'mi-equipo';
  colorSeleccionado: string = '#ffffff'; // Valor inicial en hexadecimal
  tipoConexion: string = 'romantico'; // Valor inicial
  personajes: any[] = [];
  asignado: boolean = false;
  equipo!: EquipoModel;
  mostrandoCuentaAtras: boolean = false;
  cuentaAtras: number = 3;
  equipoElegido: number = 0;
  escudos: number = 0;
  objetoAsignadoHoy: boolean = false;
  objetos: any[] = [];

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
      if (
        seccion === 'estado' ||
        seccion === 'mi-equipo' ||
        seccion === 'inventario'
      ) {
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

    this.obtenerDatosEquipo();

    this.verificarAsignacion();
    //console.log('ID del personaje:', this.id);
  }

  openDialog(title: string, message: string): void {
    this.dialog.open(DialogComponent, {
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

  private obtenerDatosEquipo() {
    this.brinderService.getEquipoAsignado('1', this.id!).subscribe({
      next: (res) => {
        this.equipo = res;
        console.log('Equipo:', this.equipo);
        this.getPersonajesEquipo(this.equipo.equipo);
      },
      error: (err) => {
        console.error('Error al comprobar equipo:', err);
      },
    });
  }

  getPersonajesEquipo(equipo: string) {
    this.brinderService.getPersonajesEquipo('1', equipo).subscribe((data) => {
      this.equipoElegido = data.personajes.length;
    });
  }

  obtenerObjeto() {
    this.brinderService.verificarObjetoAsignadoHoy(this.id!).subscribe({
      next: (asignadoHoy) => {
        this.objetoAsignadoHoy = asignadoHoy; // Actualizar el estado del botón
        if (asignadoHoy) {
          this.openDialog(
            'Información',
            'Ya has obtenido un objeto hoy. Vuelve mañana.'
          );
        } else {
          this.mostrandoCuentaAtras = true;
          this.cuentaAtras = 3;

          const intervalo = setInterval(() => {
            this.cuentaAtras--;
            if (this.cuentaAtras === 0) {
              clearInterval(intervalo);
              this.asignarObjeto();
              this.mostrandoCuentaAtras = false;
            }
          }, 1000);
        }
      },
      error: (err) => {
        console.error('Error al verificar objeto asignado:', err);
      },
    });
  }

  asignarObjeto() {
    let objetoId = '';
    let tipos = [];

    this.brinderService.tiposObjeto().subscribe((data) => {
      tipos = data.map((tipo) => tipo.id);
      // Seleccionar un objeto aleatorio con las mismas probabilidades
      const indiceAleatorio = Math.floor(Math.random() * tipos.length);
      objetoId = tipos[indiceAleatorio];

      const objeto = {
        personaje_id: this.id!,
        objeto_id: objetoId,
        killer_id: '1',
        equipo: this.equipo.equipo,
      };
      console.log('Objeto:', objeto);

      this.brinderService
        .asignarObjeto(objeto)
        .toPromise()
        .then(() => {
          this.objetoAsignadoHoy = true; // Actualizar el estado
          this.mostrandoCuentaAtras = false; // Ocultar el botón
          this.misObjetos(); // Actualizar la lista de objetos
        });
    });
  }

  verificarAsignacion() {
    this.brinderService.verificarObjetoAsignadoHoy(this.id!).subscribe({
      next: (asignadoHoy) => {
        this.objetoAsignadoHoy = asignadoHoy;
      },
      error: (err) => {
        console.error('Error al verificar objeto asignado:', err);
      },
    });
    this.misObjetos();
  }

  misObjetos() {
    this.brinderService.getMisObjetos(this.id!).subscribe((data) => {
      this.objetos = data;
    });
  }

  usarObjeto(objeto: any) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: 'Usar Objeto',
        message: `¿Deseas usar el objeto "${objeto.nombre}"?`,
        showCancel: true,
      },
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado === 'true') {
        if (objeto.tipo === 'escudo') {
          if (this.equipo.escudo < 3) {
            // Validación para máximo 3 escudos
            const personaje_killer = {
              equipo: this.equipo.equipo,
              personaje_id: this.id!,
              activo: this.equipo.activo,
              killer_id: '1',
              mision_individual: this.equipo.mision,
              escudo: this.equipo.escudo + 1,
              vida: this.equipo.vida,
            };
            this.brinderService
              .actualizarPersonajeKiller(
                personaje_killer.killer_id,
                personaje_killer.personaje_id,
                personaje_killer
              )
              .subscribe((res) => {
                console.log('Escudo actualizado:', res);
                this.eliminarObjeto(objeto.id); // Eliminar el objeto después de usarlo
                this.obtenerDatosEquipo(); // Actualizar el equipo
              });
            this.openDialog('Éxito', 'Has aumentado tu escudo.');
          } else {
            this.openDialog('Advertencia', 'No puedes tener más de 3 escudos.');
          }
        } else if (objeto.tipo === 'bomba') {
          this.seleccionarObjetivo(objeto);
        }
      }
    });
  }

  eliminarObjeto(objetoId: string) {
    this.brinderService.eliminarObjeto(objetoId).subscribe({
      next: () => {
        this.objetos = this.objetos.filter((obj) => obj.id !== objetoId); // Actualizar la lista local de objetos
        console.log('Objeto eliminado:', objetoId);
        this.misObjetos();
      },
      error: (err) => {
        console.error('Error al eliminar el objeto:', err);
      },
    });
  }

  seleccionarObjetivo(objeto: any) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: 'Seleccionar Objetivo',
        message: 'Selecciona un personaje para usar la bomba.',
        showCancel: true,
      },
    });

    dialogRef.afterClosed().subscribe((personajeSeleccionado) => {
      if (personajeSeleccionado) {
        this.brinderService.quitarEscudo(personajeSeleccionado.id).subscribe({
          next: () => {
            this.openDialog(
              'Éxito',
              `Has usado la bomba contra ${personajeSeleccionado.nick}.`
            );
          },
          error: (err) => {
            console.error('Error al usar la bomba:', err);
          },
        });
      }
    });
  }
}
