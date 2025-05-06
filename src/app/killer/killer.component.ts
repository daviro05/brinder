import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Utils } from '../shared/utils';
import { BrinderService } from '../shared/services/brinder.service';

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
  tipo: string = 'brinder';
  vivos: string = '';
  muertos: string = '';
  estadoSeleccionado: string = 'vivo'; // Nuevo estado seleccionado
  equipoRojo: any[] = [];
  equipoAzul: any[] = [];
  personajesPendientes: any[] = []; // Arreglo para personajes pendientes
  personajesPendientesName: string = '';
  seccionActiva: string = 'estado';

  constructor(
    private brinderService: BrinderService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.utils = new Utils(this.router);

    this.route.queryParams.subscribe((params) => {
      const seccion = params['seccion'];
      if (seccion === 'estado' || seccion === 'log-batalla') {
        this.seccionActiva = seccion;
      }
    });
  }

  // Este método se ejecuta cuando el componente se inicializa
  ngOnInit() {
    this.loadCharacters();
    this.getPersonajesEquipo(); // Llamar al método para obtener personajes del equipo
    this.obtenerKillerLog();
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
    this.brinderService.obtenerLogKiller().subscribe((log) => {
      this.killerLog = log;
      console.log('Log de acciones:', this.killerLog);
    });
  }
}
