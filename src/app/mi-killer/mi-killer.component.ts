import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
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
  equipoElegidoVivos: number = 0;
  puntosEquipoElegido: number = 0;
  escudos: number = 0;
  objetoAsignadoHoy: boolean = false;
  objetos: any[] = [];
  ataqueDeshabilitado: boolean = false; // Nueva variable para controlar el estado del botón

  equipoRojo: any[] = [];
  equipoAzul: any[] = [];
  configKiller: any = {};

  constructor(
    protected override buzonService: BuzonService,
    protected override router: Router,
    protected override dialog: MatDialog,
    protected brinderService: BrinderService,
    private route: ActivatedRoute // Agregado para leer parámetros de la URL
  ) {
    super(buzonService, router, dialog);
    this.utils = new Utils(this.router);

    // Restaurar el estado del botón desde localStorage
    const deshabilitadoHasta = localStorage.getItem('ataqueDeshabilitadoHasta');
    if (deshabilitadoHasta && new Date(deshabilitadoHasta) > new Date()) {
      this.ataqueDeshabilitado = true;
      const tiempoRestante =
        new Date(deshabilitadoHasta).getTime() - new Date().getTime();
      setTimeout(() => {
        this.ataqueDeshabilitado = false;
        localStorage.removeItem('ataqueDeshabilitadoHasta');
      }, tiempoRestante);
    }

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
    this.obtenerKillerConfig();
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

  obtenerDatosEquipo(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.brinderService.getEquipoAsignado('1', this.id!).subscribe({
        next: (res) => {
          this.equipo = res;
          this.getPersonajesEquipo(this.equipo.equipo);
          resolve(res);
        },
        error: (err) => {
          console.error('Error al comprobar equipo:', err);
          reject(err);
        },
      });
    });
  }

  getPersonajesEquipo(equipo: string) {
    this.brinderService.getPersonajesEquipo('1', equipo).subscribe((data) => {
      this.equipoElegido = data.personajes.length;
      this.equipoElegidoVivos = data.personajes.filter(
        (personaje: any) => personaje.vida === 1
      ).length;
    });
  }

  //Objetos

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
      tipos.sort((a, b) => a - b);

      // Seleccionar un objeto aleatorio con las mismas probabilidades
      /*const probabilidades = [
        0.15, 0.15, 0.15, 0.15, 0.1, 0.1, 0.1, 0.05, 0.05,
      ];
      const sumaProbabilidades = probabilidades.reduce((a, b) => a + b, 0);
      const random = Math.random() * sumaProbabilidades;
      let acumulado = 0;
      let indiceAleatorio = 0;

      for (let i = 0; i < probabilidades.length; i++) {
        acumulado += probabilidades[i];
        if (random <= acumulado) {
          indiceAleatorio = i;
          break;
        }
      }
      objetoId = tipos[indiceAleatorio];*/

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
              objeto_id: null,
              personaje_objetivo_id: null,
              personaje_objetivo_name: null,
              resultado: '+1 objeto',
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

  misObjetos(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.brinderService.getMisObjetos(this.id!).subscribe({
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

  async usarObjeto(objeto: any) {
    await this.misObjetos();
    await this.obtenerDatosEquipo();

    // Comprobar que el objeto está en this.objetos
    const objetoEncontrado = this.objetos.find((o) => o.id === objeto.id);
    if (!objetoEncontrado || objeto.usado === 1) {
      this.openDialog(
        'Error',
        'El objeto no está disponible en tu inventario o ya ha sido usado.'
      );
      return;
    }

    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: 'Usar Objeto',
        message: `¿Deseas usar el objeto "${objeto.nombre}"?`,
        showCancel: true,
      },
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado === true && this.equipo.vida === 1 && objeto.usado === 0) {
        if (objeto.tipo === 'escudo' && this.equipo.escudo >= 3) {
          this.openDialog(
            'Advertencia',
            'No puedes tener más de 3 escudos. El objeto no se ha usado.'
          );
          return; // Salir sin llamar a usarObjeto
        }

        this.brinderService.usarObjeto(objeto.id).subscribe({
          next: () => {
            if (objeto.tipo === 'escudo') {
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
                      accion: objeto.nombre,
                      objeto_id: objeto.objeto_id,
                      personaje_objetivo_id: null,
                      personaje_objetivo_name: null,
                      resultado:
                        '+' +
                        objeto.valor +
                        ' en defensa (' +
                        nuevoEscudo +
                        '/3)🛡️',
                      equipo: this.equipo.equipo,
                    })
                    .subscribe(() => {
                      this.incrementarPuntos(this.equipo.equipo, 5);
                    });
                });
              this.openDialog(
                'Éxito',
                'Has aumentado +' + objeto.valor + ' tu defensa.'
              );
              this.misObjetos();
            } else if (
              objeto.tipo === 'bomba' ||
              objeto.tipo === 'eliminar' ||
              objeto.tipo === 'gomana'
            ) {
              this.seleccionarObjetivo(objeto);
            } else if (objeto.tipo === 'cambio') {
              this.intercambiarInventario(objeto);
            } else if (objeto.tipo === 'puntos') {
              this.brinderService
                .registrarLogKiller({
                  killer_id: '1',
                  personaje_id: this.id!,
                  personaje_name: this.nombrePersonaje,
                  accion: objeto.nombre,
                  objeto_id: objeto.objeto_id,
                  personaje_objetivo_id: null,
                  personaje_objetivo_name: null,
                  resultado:
                    '+' +
                    objeto.valor +
                    ' puntos para el equipo ' +
                    this.equipo.equipo,
                  equipo: this.equipo.equipo,
                })
                .subscribe(() => {
                  this.incrementarPuntos(this.equipo.equipo, objeto.valor);
                });
            }
          },
          error: (err: { status: number }) => {
            if (err.status === 409) {
              this.openDialog(
                'Advertencia',
                'Este objeto ya ha sido usado o eliminado...'
              );
              /*this.brinderService
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
                .subscribe();*/
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
            message: 'Selecciona un personaje para usar ' + objeto.nombre,
            personajes: personajesContrarios,
          },
          disableClose: true,
        });

        dialogRef.afterClosed().subscribe((personajeSeleccionado) => {
          //console.log('Diálogo cerrado:', personajeSeleccionado);
          if (personajeSeleccionado) {
            this.brinderService
              .getEquipoAsignado('1', personajeSeleccionado.personaje_id)
              .subscribe({
                next: (res) => {
                  let equipoPersonajeSel = res;
                  if (objeto.tipo === 'bomba') {
                    this.quitarDefensa(
                      equipoPersonajeSel,
                      objeto,
                      personajeSeleccionado
                    );
                  } else if (
                    objeto.tipo === 'eliminar' ||
                    objeto.tipo === 'gomana'
                  ) {
                    this.brinderService
                      .getMisObjetos(personajeSeleccionado.personaje_id)
                      .subscribe((data) => {
                        let objetosEnemigo = data.filter(
                          (objeto: any) => objeto.usado === 0
                        );

                        if (objetosEnemigo.length === 0) {
                          this.openDialog(
                            '¡Has fallado!',
                            `${personajeSeleccionado.name} no tiene objetos disponibles.`
                          );
                          this.obtenerDatosEquipo();
                          this.brinderService
                            .registrarLogKiller({
                              killer_id: '1',
                              personaje_id: this.id!,
                              personaje_name: this.nombrePersonaje,
                              accion: objeto.nombre,
                              objeto_id: objeto.objeto_id,
                              personaje_objetivo_id:
                                personajeSeleccionado?.personaje_id ?? null,
                              personaje_objetivo_name:
                                personajeSeleccionado?.name ?? null,
                              resultado:
                                'Sin éxito. ' +
                                personajeSeleccionado?.name +
                                ' no tiene objetos',
                              equipo: this.equipo.equipo,
                            })
                            .subscribe();
                          return;
                        }

                        if (objeto.tipo === 'eliminar') {
                          // obtener un indice aleatorio de objetosEnemigo
                          let indiceAleatorio = Math.floor(
                            Math.random() * objetosEnemigo.length
                          );
                          let objetoAleatorio = objetosEnemigo[indiceAleatorio];
                          this.brinderService
                            .eliminarObjeto(objetoAleatorio.id)
                            .subscribe((res) => {
                              this.openDialog(
                                'Éxito',
                                `Has eliminado ${objetoAleatorio.nombre} a ${personajeSeleccionado.name}.`
                              );
                              this.obtenerDatosEquipo();
                              this.brinderService
                                .registrarLogKiller({
                                  killer_id: '1',
                                  personaje_id: this.id!,
                                  personaje_name: this.nombrePersonaje,
                                  accion: objeto.nombre,
                                  objeto_id: objeto.objeto_id,
                                  personaje_objetivo_id:
                                    personajeSeleccionado?.personaje_id ?? null,
                                  personaje_objetivo_name:
                                    personajeSeleccionado?.name ?? null,
                                  resultado:
                                    'Elimina ' +
                                    objetoAleatorio.nombre +
                                    ' a ' +
                                    personajeSeleccionado?.name,
                                  equipo: this.equipo.equipo,
                                })
                                .subscribe(() => {
                                  this.incrementarPuntos(
                                    this.equipo.equipo,
                                    15
                                  );
                                });
                            });
                        }

                        if (objeto.tipo === 'gomana') {
                          //eliminar todos los objetos del enemigo
                          objetosEnemigo.forEach((objeto: any) => {
                            this.brinderService
                              .eliminarObjeto(objeto.id)
                              .subscribe();
                          });
                          this.openDialog(
                            'Éxito',
                            `Has usado ${objeto.nombre} contra ${personajeSeleccionado.name} eliminando todos sus objetos.`
                          );
                          this.obtenerDatosEquipo();
                          this.brinderService
                            .registrarLogKiller({
                              killer_id: '1',
                              personaje_id: this.id!,
                              personaje_name: this.nombrePersonaje,
                              accion: objeto.nombre,
                              objeto_id: objeto.objeto_id,
                              personaje_objetivo_id:
                                personajeSeleccionado?.personaje_id ?? null,
                              personaje_objetivo_name:
                                personajeSeleccionado?.name ?? null,
                              resultado:
                                'Elimina todos los objetos de ' +
                                personajeSeleccionado?.name,
                              equipo: this.equipo.equipo,
                            })
                            .subscribe(() => {
                              this.incrementarPuntos(this.equipo.equipo, 20);
                            });
                        }
                      });
                  }
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

  quitarDefensa(
    equipoPersonajeSel: EquipoModel,
    objeto: any,
    personajeSeleccionado: any
  ) {
    equipoPersonajeSel.escudo = Math.max(
      0,
      equipoPersonajeSel.escudo - objeto.valor
    );

    this.brinderService
      .actualizarPersonajeKiller(
        '1',
        personajeSeleccionado.personaje_id,
        equipoPersonajeSel
      )
      .subscribe({
        next: () => {
          this.openDialog(
            'Éxito',
            `Has usado ${objeto.nombre} contra ${personajeSeleccionado.name} quitándole ${objeto.valor} de defensa.`
          );
          this.obtenerDatosEquipo();
          this.brinderService
            .registrarLogKiller({
              killer_id: '1',
              personaje_id: this.id!,
              personaje_name: this.nombrePersonaje,
              accion: objeto.nombre,
              objeto_id: objeto.objeto_id,
              personaje_objetivo_id:
                personajeSeleccionado?.personaje_id ?? null,
              personaje_objetivo_name: personajeSeleccionado?.name ?? null,
              resultado:
                '-' +
                objeto.valor +
                ' de defensa a ' +
                personajeSeleccionado?.name +
                ' (' +
                Math.max(0, personajeSeleccionado?.escudo - objeto.valor) +
                '/3)🛡️',
              equipo: this.equipo.equipo,
            })
            .subscribe(() => {
              this.incrementarPuntos(this.equipo.equipo, 10);
            });
        },
        error: (err) => {
          console.error('Error al usar la bomba:', err);
        },
      });
  }

  abrirInfoInventario(): void {
    this.dialog.open(DialogComponent, {
      data: {
        title: 'Información del Inventario',
        message: `<img src="assets/objetos1.jpg" width="100%"/>
        <br>
        <hr>
        <img src="assets/objetos2.jpg" width="100%" />`,
      },
    });
  }

  intercambiarInventario(objeto: any) {
    this.brinderService.getPersonajesEquipo('1').subscribe((data) => {
      const personajes = data.personajes.sort((a: any, b: any) => {
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
          title: 'Seleccionar Personaje',
          message: 'Selecciona un personaje para usar ' + objeto.nombre,
          personajes: personajes,
        },
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((personajeSeleccionado) => {
        //console.log('Diálogo cerrado:', personajeSeleccionado);
        if (personajeSeleccionado) {
          this.brinderService
            .intercambiarInventario(
              personajeSeleccionado.personaje_id,
              this.id!
            )
            .subscribe({
              next: (res) => {
                this.openDialog(
                  'Éxito',
                  `Has intercambiado tu Inventario con ${personajeSeleccionado.name}.`
                );
                this.obtenerDatosEquipo();
                this.misObjetos();
                this.brinderService
                  .registrarLogKiller({
                    killer_id: '1',
                    personaje_id: this.id!,
                    personaje_name: this.nombrePersonaje,
                    accion: objeto.nombre,
                    objeto_id: objeto.objeto_id,
                    personaje_objetivo_id:
                      personajeSeleccionado?.personaje_id ?? null,
                    personaje_objetivo_name:
                      personajeSeleccionado?.name ?? null,
                    resultado: 'Intercambian su Inventario',
                    equipo: this.equipo.equipo,
                  })
                  .subscribe(() => {
                    this.incrementarPuntos(this.equipo.equipo, 15);
                  });
                return;
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

  //Killer

  async realizarAtaque() {
    try {
      await this.obtenerDatosEquipo();

      const escudo = this.equipo.escudo_objetivo;
      const vida = this.equipo.vida_objetivo;

      if (escudo > 0 || vida === 0) {
        this.openDialog(
          'Advertencia',
          'Tu objetivo tiene defensa o ya está muerto.'
        );
        return;
      }

      const dialogRef = this.dialog.open(DialogComponent, {
        data: {
          title: 'Realizar ataque Killer',
          message: `Vas a realizar un ataque killer. Tendrás 10 minutos para realizarlo. ¿Deseas continuar?`,
          showCancel: true,
        },
      });

      dialogRef.afterClosed().subscribe((confirmado) => {
        if (confirmado === true) {
          this.ataqueDeshabilitado = true;

          const deshabilitadoHasta = new Date(
            new Date().getTime() + 10 * 60 * 1000
          );
          localStorage.setItem(
            'ataqueDeshabilitadoHasta',
            deshabilitadoHasta.toISOString()
          );

          setTimeout(() => {
            this.ataqueDeshabilitado = false;
            localStorage.removeItem('ataqueDeshabilitadoHasta');
          }, 10 * 60 * 1000);

          this.obtenerDatosEquipo(); // Lo puedes dejar como está

          this.brinderService
            .registrarLogKiller({
              killer_id: '1',
              personaje_id: this.id!,
              personaje_name: this.nombrePersonaje,
              accion: 'Killer',
              objeto_id: null,
              personaje_objetivo_id: null,
              personaje_objetivo_name: null,
              resultado: 'Se dispone a atacar',
              equipo: this.equipo.equipo,
            })
            .subscribe();

          this.openDialog(
            'Ataque Killer',
            'Tienes 10 minutos para atacar a tu enemigo.'
          );
        }
      });
    } catch (error) {
      console.error('Error al obtener datos del equipo', error);
    }
  }

  heMuerto() {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: '¿Te han matado?',
        message: `Si tu killer te ha matado, pulsa en aceptar. ¿Deseas continuar?`,
        showCancel: true,
      },
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado === true) {
        const personaje_killer = {
          equipo: this.equipo.equipo,
          personaje_id: this.id!,
          activo: this.equipo.activo,
          killer_id: '1',
          mision_individual: this.equipo.mision,
          escudo: this.equipo.escudo,
          vida: 0,
        };
        //console.log('Personaje killer:', personaje_killer);

        this.brinderService
          .actualizarPersonajeKiller(
            personaje_killer.killer_id,
            personaje_killer.personaje_id,
            personaje_killer
          )
          .subscribe((res) => {
            this.obtenerDatosEquipo();
          });

        this.openDialog(
          'Has muerto',
          'Has sufrido la crucifixión. Tu personaje ha muerto.'
        );

        this.brinderService
          .registrarLogKiller({
            killer_id: '1',
            personaje_id: this.id!,
            personaje_name: this.nombrePersonaje,
            accion: 'Crucifixión',
            objeto_id: null,
            personaje_objetivo_id: null,
            personaje_objetivo_name: null,
            resultado: this.nombrePersonaje + ' ha muerto',
            equipo: this.equipo.equipo,
          })
          .subscribe(() => {
            let equipoContario =
              this.equipo.equipo === 'rojo' ? 'azul' : 'rojo';
            this.incrementarPuntos(equipoContario, 50);
          });
      }
    });
  }

  incrementarPuntos(equipo: string, puntos: number) {
    let puntosTotales =
      equipo === 'rojo'
        ? { puntosR: puntos, puntosA: 0 }
        : { puntosR: 0, puntosA: puntos };
    this.brinderService.registrarKillerConfig(puntosTotales).subscribe(() => {
      setTimeout(() => {
        this.brinderService
          .registrarLogKiller({
            killer_id: '1',
            personaje_id: this.id!,
            personaje_name: this.nombrePersonaje,
            accion: 'puntos',
            objeto_id: null,
            personaje_objetivo_id: null,
            personaje_objetivo_name: null,
            resultado: 'Equipo ' + equipo + ' +' + puntos + ' puntos',
            equipo: equipo,
          })
          .subscribe();
      }, 2000);
    });
  }

  obtenerKillerConfig() {
    this.brinderService.obtenerKillerConfig().subscribe((config) => {
      this.configKiller = config;
      this.puntosEquipoElegido =
        this.equipo.equipo === 'rojo'
          ? this.configKiller.puntos_rojo
          : this.configKiller.puntos_azul;
    });
  }
}
