import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { BrinderService } from 'src/app/shared/services/brinder.service';
import { Utils } from 'src/app/shared/utils';

@Component({
  selector: 'app-killer-admin',
  templateUrl: './killer.component.html',
  styleUrls: ['./killer.component.scss'],
})
export class KillerAdminComponent {
  killerLogForm = {
    personajes_ids: [] as number[],
    accion: 'puntos',
    resultado: '',
    equipo: '',
  };
  resultadoPersonalizado: string = ''; // Nuevo campo para resultado personalizado
  valorPersonalizado: number = 0; // Valor personalizado para puntos'';
  personajes: any[] = [];
  seccionActiva: string = 'crear-log';
  utils: Utils;

  equipoElegido = 'rojo'; // Valor por defecto para el equipo elegido

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
      if (
        seccion === 'crear-log' ||
        seccion === 'asignar-objetos' ||
        seccion === 'acciones'
      ) {
        this.seccionActiva = seccion;
      }
    });

    this.brinderService.obtenerPersonajes('brinder').subscribe((data) => {
      this.personajes = data;

      // Establecer por defecto a David si está en la lista
      const david = this.personajes.find((p) => p.id === 51);
      if (david) {
        this.killerLogForm.personajes_ids = [51];
      }
    });
  }

  OnInit() {
    this.killerLogForm.personajes_ids; // Inicializar cualquier lógica adicional si es necesario
  }

  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;
    this.router.navigate([], {
      queryParams: { seccion },
      queryParamsHandling: 'merge',
    });
  }

  onResultadoChange() {
    if (this.killerLogForm.resultado !== 'otro') {
      this.resultadoPersonalizado = '';
    }
  }

  crearLog(): void {
    // Usar el resultado personalizado si corresponde
    const resultadoFinal =
      this.killerLogForm.resultado === 'otro'
        ? this.resultadoPersonalizado.trim()
        : this.killerLogForm.resultado.trim();

    this.killerLogForm.accion = this.killerLogForm.accion.trim();
    this.killerLogForm.equipo = this.killerLogForm.equipo.trim();

    if (
      !this.killerLogForm.personajes_ids.length ||
      !this.killerLogForm.accion ||
      !resultadoFinal ||
      !this.killerLogForm.equipo
    ) {
      this.openDialog('Error', 'Todos los campos son obligatorios.');
      return;
    }

    const asignaciones = this.killerLogForm.personajes_ids.map(
      (personaje_id) => {
        const log = {
          personaje_id,
          accion: this.killerLogForm.accion,
          resultado: resultadoFinal,
          equipo: this.killerLogForm.equipo,
        };
        return this.brinderService
          .registrarLogKiller({
            killer_id: '1',
            personaje_id: log.personaje_id.toString(),
            personaje_name: 'David',
            accion: 'puntos',
            objeto_id: null,
            personaje_objetivo_id: null,
            personaje_objetivo_name: null,
            resultado: log.resultado,
            equipo: log.equipo,
          })
          .subscribe(() => {
            this.incrementarPuntos(log.equipo, this.valorPersonalizado);
          });
      }
    );

    Promise.all(asignaciones)
      .then(() => {
        this.openDialog('Éxito', 'Log creado correctamente.');
        this.killerLogForm = {
          personajes_ids: [],
          accion: '',
          resultado: '',
          equipo: '',
        };
        this.resultadoPersonalizado = '';
      })
      .catch((error) => {
        console.error('Error al crear el log:', error);
        this.openDialog('Error', 'Hubo un error al crear el log.');
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

  incrementarPuntos(equipo: string, puntos: number) {
    let puntosTotales =
      equipo === 'rojo'
        ? { puntosR: puntos, puntosA: 0 }
        : { puntosR: 0, puntosA: puntos };
    this.brinderService.registrarKillerConfig(puntosTotales).subscribe();
  }

  realizarAccion(accion: string) {
    if (accion !== 'add' && accion !== 'remove') return;

    const isAdd = accion === 'add';
    const data = {
      equipo: this.equipoElegido,
      accion: isAdd ? 'add' : 'remove',
    };
    const resultado = isAdd
      ? `Añadidos 🛡️ al equipo ${this.equipoElegido}`
      : `Eliminados 🛡️ del equipo ${this.equipoElegido}`;

    this.brinderService.realizarAccionKiller(data).subscribe(() => {
      this.brinderService.registrarLogKiller({
        killer_id: '1',
        personaje_id: '51',
        personaje_name: 'David',
        accion: 'puntos',
        objeto_id: null,
        personaje_objetivo_id: null,
        personaje_objetivo_name: null,
        resultado,
        equipo: this.equipoElegido,
      }).subscribe(() => {
        this.openDialog('Éxito', `Acción ${accion} realizada correctamente.`);
      });
    });
  }
}
