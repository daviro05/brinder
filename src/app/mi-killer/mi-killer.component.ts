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
      //console.log('Objeto:', objeto);

      this.brinderService
        .asignarObjeto(objeto)
        .toPromise()
        .then(() => {
          this.objetoAsignadoHoy = true; // Actualizar el estado
          this.mostrandoCuentaAtras = false; // Ocultar el botón
          this.misObjetos(); // Actualizar la lista de objetos
          this.brinderService
            .registrarLogKiller({
              killer_id: '1',
              personaje_id: this.id!,
              personaje_name: this.nombrePersonaje,
              accion: 'Inventario',
              objeto_id: objeto.objeto_id,
              personaje_objetivo_id: null,
              personaje_objetivo_name: null,
              resultado: 'Obtiene 1 objeto',
              equipo: this.equipo.equipo,
            })
            .subscribe();
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
      //console.log('Objetos:', this.objetos);
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
      if (confirmado === true) {
        this.brinderService.usarObjeto(objeto.id).subscribe({
          next: () => {
            if (objeto.tipo === 'escudo') {
              if (this.equipo.escudo < 3) {
                const nuevoEscudo = Math.min(
                  this.equipo.escudo + objeto.valor,
                  3
                );
                const personaje_killer = {
                  equipo: this.equipo.equipo,
                  personaje_id: this.id!,
                  activo: this.equipo.activo,
                  killer_id: '1',
                  mision_individual: this.equipo.mision,
                  escudo: nuevoEscudo,
                  vida: this.equipo.vida,
                };
                this.brinderService
                  .actualizarPersonajeKiller(
                    personaje_killer.killer_id,
                    personaje_killer.personaje_id,
                    personaje_killer
                  )
                  .subscribe((res) => {
                    this.obtenerDatosEquipo();
                    this.brinderService
                      .registrarLogKiller({
                        killer_id: '1',
                        personaje_id: this.id!,
                        personaje_name: this.nombrePersonaje,
                        accion: 'Usa ' + objeto.nombre,
                        objeto_id: objeto.objeto_id,
                        personaje_objetivo_id: null,
                        personaje_objetivo_name: null,
                        resultado: 'Escudo aumentado en + ' + objeto.valor,
                        equipo: this.equipo.equipo,
                      })
                      .subscribe();
                  });
                this.openDialog(
                  'Éxito',
                  'Has aumentado + ' + objeto.valor + ' tu escudo.'
                );
                this.misObjetos();
              } else {
                this.openDialog(
                  'Advertencia',
                  'No puedes tener más de 3 escudos. El objeto no se ha usado'
                );
              }
            } else if (objeto.tipo === 'bomba') {
              this.seleccionarObjetivo(objeto);
            }
          },
          error: (err: { status: number }) => {
            if (err.status === 409) {
              this.openDialog(
                'Advertencia',
                'Este objeto ya ha sido usado...<br>' +
                  this.nombrePersonaje +
                  ' has penalizado a tu equipo. Las trampas no le gustan al Centurión.'
              );
              this.brinderService
                .registrarLogKiller({
                  killer_id: '1',
                  personaje_id: this.id!,
                  personaje_name: this.nombrePersonaje,
                  accion: 'Trampas',
                  objeto_id: objeto.objeto_id,
                  personaje_objetivo_id: null,
                  personaje_objetivo_name: null,
                  resultado: 'Penalización por trampas',
                  equipo: this.equipo.equipo,
                })
                .subscribe();
            } else {
              console.error('Error al usar el objeto:', err);
            }
          },
        });
      }
    });
    this.misObjetos();
  }

  seleccionarObjetivo(objeto: any) {
    const equipoContrario = this.equipo.equipo === 'rojo' ? 'azul' : 'rojo';

    this.brinderService
      .getPersonajesEquipo('1', equipoContrario)
      .subscribe((data) => {
        const personajesContrarios = data.personajes.sort((a: any, b: any) => {
          const nombreA =
            a.name
              ?.toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '') || '';
          const nombreB =
            b.name
              ?.toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '') || '';
          return nombreA > nombreB ? 1 : nombreA < nombreB ? -1 : 0;
        });

        const dialogRef = this.dialog.open(DialogComponent, {
          data: {
            title: 'Seleccionar Objetivo',
            message: 'Selecciona un personaje para usar la bomba.',
            personajes: personajesContrarios,
          },
          disableClose: true,
        });

        dialogRef.afterClosed().subscribe((personajeSeleccionado) => {
          //console.log('Diálogo cerrado:', personajeSeleccionado);
          if (personajeSeleccionado) {
            this.brinderService
              .getEquipoAsignado('1', personajeSeleccionado.id)
              .subscribe({
                next: (res) => {
                  let equipoPersonajeSel = res;
                  equipoPersonajeSel.escudo = Math.max(
                    0,
                    equipoPersonajeSel.escudo - objeto.valor
                  );

                  this.brinderService
                    .actualizarPersonajeKiller(
                      '1',
                      personajeSeleccionado.id,
                      equipoPersonajeSel
                    )
                    .subscribe({
                      next: () => {
                        this.openDialog(
                          'Éxito',
                          `Has usado una bomba contra ${personajeSeleccionado.name} quitándole ${objeto.valor} escudo(s).`
                        );
                        this.obtenerDatosEquipo();
                        this.brinderService
                          .registrarLogKiller({
                            killer_id: '1',
                            personaje_id: this.id!,
                            personaje_name: this.nombrePersonaje,
                            accion: 'Usa ' + objeto.nombre,
                            objeto_id: objeto.objeto_id,
                            personaje_objetivo_id:
                              personajeSeleccionado?.id ?? null,
                            personaje_objetivo_name:
                              personajeSeleccionado?.name ?? null,
                            resultado:
                              'Quita ' +
                              objeto.valor +
                              ' escudo(s) a ' +
                              personajeSeleccionado?.name,
                            equipo: this.equipo.equipo,
                          })
                          .subscribe();
                      },
                      error: (err) => {
                        console.error('Error al usar la bomba:', err);
                      },
                    });
                },
                error: (err) => {
                  console.error('Error al comprobar equipo:', err);
                },
              });
          }
        });
      });
    this.misObjetos();
  }

  abrirInfoInventario(): void {
    this.dialog.open(DialogComponent, {
      data: {
        title: 'Información del Inventario',
        message: `
  <div style="text-align: left; font-family: Arial, sans-serif;">
    <p><b>Los objetos que pueden tocarte son los siguientes:</b></p>
    <p><b>🛡️ Escudos (aumentan)</b></p>

    <div style="margin-bottom: 16px;">
      <img src="assets/objetos/escudo.png" width="40%" />
      <div>Plumas de Ganso: +1</div>
    </div>
        <br>
    <div style="margin-bottom: 16px;">
      <img src="assets/objetos/centurion.png"  width="40%" />
      <div>Casco del Centurión: +2</div>
    </div>
    <br>
    <p><b>💣 Bombas (quitan escudo a un enemigo)</b></p>
    <div style="margin-bottom: 16px;">
      <img src="assets/objetos/bomba.png" alt="Calabaza explosiva" width="40%" />
      <div>Calabaza explosiva: -1 enemigo</div>
    </div>
        <br>
    <div style="margin-bottom: 16px;">
      <img src="assets/objetos/sandalias.png" alt="Sandalias explosivas" width="40%" />
      <div>Sandalias explosivas: -2 enemigo</div>
    </div>
    <br>
    <p><b>✨ Especiales (Muy pronto)</b></p>
  </div>
`,
      },
    });
  }

  // Unirse a un equipo

  unirseEquipo() {
    this.mostrandoCuentaAtras = true;
    this.cuentaAtras = 5;

    const intervalo = setInterval(() => {
      this.cuentaAtras--;
      if (this.cuentaAtras === 0) {
        clearInterval(intervalo);
        this.brinderService.asignarEquipo(this.personaje.id, '1').subscribe({
          next: (res) => {
            this.equipo.asignado = true;
            this.equipo.equipo = res.equipo || '';
            this.mostrandoCuentaAtras = false;
            this.getPersonajesEquipo(this.equipo.equipo);
            this.obtenerDatosEquipo();
          },
          error: (err) => {
            console.error('Error al asignar equipo:', err);
            this.mostrandoCuentaAtras = false;
          },
        });
      }
    }, 1000);
  }

  confirmarUnirse() {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: 'Confirmar',
        message: '¿Estás seguro de que deseas unirte a un equipo?',
        showCancel: true,
      },
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      console.log('Diálogo cerrado:', confirmado);
      if (confirmado === true) {
        this.unirseEquipo();
        //this.unirPersonajesMasivamente();
      }
    });
  }

  /*unirPersonajesMasivamente(): void {
    const ids = [
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20',
      '21',
      '22',
      '23',
      '24',
      '25',
      '26',
      '28',
      '29',
      '30',
      '31',
      '33',
      '41',
      '44',
      '45',
      '46',
      '47',
      '48',
      '49',
      '50',
      '51',
      '52',
      '53',
      '54',
      '55',
      '56',
      '57',
      '58',
      '59',
      '60',
      '62',
      '65',
      '66',
      '94',
      '102',
      '103',
      '104',
      '105',
    ];
    const equipoId = '1'; // ID del killer

    ids.forEach((id) => {
      this.brinderService.asignarEquipo(id, equipoId).subscribe({
        next: (res) => {
          const total = ids.length;
          const index = ids.indexOf(id) + 1;
          console.log(
            `Asignando personaje ${index}/${total}: ID ${id} al equipo ${equipoId}`
          );
        },
        error: (err) => {
          console.error(`Error al asignar personaje con ID ${id}:`, err);
        },
      });
    });
  }*/
}
