import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Utils } from '../shared/utils';
import { BrinderService } from '../shared/services/brinder.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-killer',
  templateUrl: './killer.component.html',
  styleUrls: ['./killer.component.scss'],
})
export class KillerComponent {
  characters: any[] = [];
  filteredCharacters: any[] = [];
  utils: Utils;
  killer: any[] = [];
  killerLog: any[] = [];
  displayedColumns: string[] = [
    'fecha',
    'accion',
    'personaje_name',
    'personaje_objetivo_name',
    'resultado',
  ];

  tipo: string = 'brinder';
  vivos: string = '';
  muertos: string = '';
  estadoSeleccionado: string = 'vivo'; // Nuevo estado seleccionado

  equipoRojo: any[] = [];
  vivosRojo: number = 0;
  equipoAzul: any[] = [];
  vivosAzul: number = 0;
  configKiller: any = {};

  killerLogRojo: any[] = []; // Log de acciones del equipo rojo
  killerLogAzul: any[] = []; // Log de acciones del equipo azul
  puntosRojo: number = 0;
  puntosAzul: number = 0;
  personajesPendientes: any[] = []; // Arreglo para personajes pendientes
  personajesPendientesName: string = '';
  seccionActiva: string = 'estado';
  personajes: any[] = []; // Lista de personajes para el filtro
  personajeSeleccionado: string | null = null; // Personaje seleccionado en el filtro
  fechaSeleccionada: Date | null = null; // Nueva propiedad para la fecha seleccionada
  killerLogFiltrado: any[] = []; // Log filtrado
  mostrarFiltro: boolean = false; // Controla la visibilidad del filtro
  equipoSeleccionado: string | null = null; // "rojo", "azul" o null

  objetosDisponibles: any[] = []; // Objetos disponibles

  constructor(
    private brinderService: BrinderService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog // Añade MatDialog aquí
  ) {
    this.utils = new Utils(this.router);

    this.route.queryParams.subscribe((params) => {
      const seccion = params['seccion'];
      if (
        seccion === 'estado' ||
        seccion === 'log-batalla' ||
        seccion === 'mercado'
      ) {
        this.seccionActiva = seccion;
      }
    });
  }

  // Este método se ejecuta cuando el componente se inicializa
  ngOnInit() {
    this.loadCharacters();
    this.getPersonajesEquipo(); // Llamar al método para obtener personajes del equipo
    //this.obtenerKillerLog();
    this.obtenerKillerConfig();
    //this.obtenerObjetosMercado(); // Cargar objetos del mercado
  }

  getPersonajesEquipo() {
    this.brinderService.getPersonajesEquipo('1', 'rojo').subscribe((data) => {
      this.equipoRojo = data.personajes.sort((a: any, b: any) => {
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

      this.vivosRojo = this.equipoRojo.filter(
        (personaje: any) => personaje.vida !== 0
      ).length;
      //console.log('Equipo Rojo:', this.equipoRojo);
      //this.obtenerPersonajesFaltantes();
    });

    this.brinderService.getPersonajesEquipo('1', 'azul').subscribe((data) => {
      this.equipoAzul = data.personajes.sort((a: any, b: any) => {
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
      this.vivosAzul = this.equipoAzul.filter(
        (personaje: any) => personaje.vida !== 0
      ).length;
      //console.log('Equipo Azul:', this.equipoAzul);
      //this.obtenerPersonajesFaltantes();
    });
  }

  // Método para cargar los personajes desde el backend
  loadCharacters() {
    this.brinderService.obtenerPersonajes(this.tipo).subscribe((data) => {
      //this.characters = data;

      this.characters = data.filter(
        (character) =>
          character.activo === 'activo' && !character.rol.includes('inactivo')
      );

      /*this.characters = this.characters.map((character) => ({
        ...character,
        estado: character.rol?.split(';')[3]?.trim(),
      }));

      this.vivos = this.characters
        .filter((character) => character.estado === 'vivo')
        .length.toString();
      this.muertos = this.characters
        .filter((character) => character.estado === 'muerto')
        .length.toString();

      this.filtrarPersonajes(); // Filtrar personajes al cargar
      */
    });
  }

  obtenerPersonajesFaltantes() {
    const idsEquipos = [
      ...this.equipoRojo.map((personaje) => personaje.id),
      ...this.equipoAzul.map((personaje) => personaje.id),
    ];
    this.personajesPendientes = this.characters.filter(
      (personaje) => !idsEquipos.includes(personaje.id)
    );
    this.personajesPendientesName = this.personajesPendientes
      .map((personaje) => personaje.name)
      .join(', ');
  }

  filtrarPersonajes() {
    if (this.estadoSeleccionado === 'vivo') {
      this.filteredCharacters = this.characters.filter(
        (character) => character.estado === 'vivo'
      );
    } else if (this.estadoSeleccionado === 'muerto') {
      this.filteredCharacters = this.characters.filter(
        (character) => character.estado === 'muerto'
      );
    } else {
      this.filteredCharacters = this.characters; // Mostrar todos
    }
  }

  seleccionarEstado(estado: string) {
    this.estadoSeleccionado = estado;
    this.filtrarPersonajes();
  }

  getCapitan(equipo: any[]): any {
    return equipo.find((c) => c.rol?.includes('capitan'));
  }

  getMiembrosSinCapitan(equipo: any[]): any[] {
    return equipo.filter((c) => !c.rol?.includes('capitan'));
  }

  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;
    this.router.navigate([], {
      queryParams: { seccion },
      queryParamsHandling: 'merge',
    });
  }

  obtenerKillerLog() {
    this.personajeSeleccionado = null;
    this.brinderService.obtenerLogKiller().subscribe((log) => {
      this.killerLog = log;
      this.killerLogFiltrado = log; // Inicialmente, mostrar todo el log
      this.killerLogRojo = this.killerLog.filter(
        (log) => log.equipo === 'rojo'
      );
      this.killerLogAzul = this.killerLog.filter(
        (log) => log.equipo === 'azul'
      );
    });
  }

  filtrarLog() {
    let filtrado = this.killerLog;

    if (this.personajeSeleccionado) {
      filtrado = filtrado.filter(
        (log) =>
          log.personaje_name === this.personajeSeleccionado ||
          log.personaje_objetivo_name === this.personajeSeleccionado
      );
    }

    if (this.fechaSeleccionada) {
      const fechaFiltro = new Date(this.fechaSeleccionada);
      filtrado = filtrado.filter((log) => {
        const fechaLog = new Date(log.fecha);
        // Comparar solo año, mes y día
        return (
          fechaLog.getFullYear() === fechaFiltro.getFullYear() &&
          fechaLog.getMonth() === fechaFiltro.getMonth() &&
          fechaLog.getDate() === fechaFiltro.getDate()
        );
      });
    }

    if (this.equipoSeleccionado) {
      filtrado = filtrado.filter(
        (log) => log.equipo === this.equipoSeleccionado
      );
    }

    this.killerLogFiltrado = filtrado;
  }

  toggleFiltro(): void {
    this.mostrarFiltro = !this.mostrarFiltro;
    this.fechaSeleccionada = null;
    this.personajeSeleccionado = null;
    this.equipoSeleccionado = null;
    this.obtenerKillerLog();
  }

  obtenerKillerConfig() {
    this.brinderService.obtenerKillerConfig().subscribe((config) => {
      this.configKiller = config;
      this.puntosRojo = this.configKiller.puntos_rojo;
      this.puntosAzul = this.configKiller.puntos_azul;
    });
    this.getPersonajesEquipo();
  }

  obtenerObjetosMercado() {
    this.brinderService.obtenerObjetosMercado().subscribe((objs) => {
      this.objetosDisponibles = objs;
    });
  }

  abrirDialogoObjeto(objeto: any) {
    // Usa el componente de dialog existente, por ejemplo DetalleObjetoDialogComponent
    this.dialog.open(DialogComponent, {
      data: {
        title: 'Información del producto',
        objeto: objeto,
      },
    });
  }

  actualizarDatos(){
    this.obtenerKillerLog();
    this.obtenerKillerConfig();
    this.obtenerObjetosMercado();
  }
}
