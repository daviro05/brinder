import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
  tipo: string = 'brinder';
  vivos: string = '';
  muertos: string = '';
  estadoSeleccionado: string = 'vivo'; // Nuevo estado seleccionado
  equipoRojo: any[] = [];
  equipoAzul: any[] = [];

  constructor(private brinderService: BrinderService, private router: Router) {
    this.utils = new Utils(this.router);
  }

  // Este método se ejecuta cuando el componente se inicializa
  ngOnInit() {
    //this.loadCharacters();
    this.getPersonajesEquipo(); // Llamar al método para obtener personajes del equipo
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
      console.log('Equipo Rojo:', this.equipoRojo);
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
      console.log('Equipo Azul:', this.equipoAzul);
    });
  }

  // Método para cargar los personajes desde el backend
  loadCharacters() {
    this.brinderService.obtenerPersonajes(this.tipo).subscribe((data) => {
      this.characters = data.filter(
        (character) => character.activo === 'activo' && character.rol !== ''
      );
      this.characters = this.characters.map((character) => ({
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
    });
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
}
