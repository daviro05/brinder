import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
  utils: Utils;
  killer: any[] = [];
  tipo: string = 'brinder';
  vivos: string = '';
  muertos: string = ''

  constructor(private brinderService: BrinderService, private router: Router) {
    this.utils = new Utils(this.router);
  }

  // Este método se ejecuta cuando el componente se inicializa
  ngOnInit() {
    this.loadCharacters();
  }

  // Método para cargar los personajes desde el backend
  loadCharacters() {
    this.brinderService.obtenerPersonajes(this.tipo).subscribe((data) => {
      this.characters = data;
      this.characters = this.characters.filter(
        (character) => character.activo === 'activo' && character.rol !== ''
      );
      this.characters = this.characters.map((character) => ({
        ...character,
        estado: character.rol?.split(';')[3]?.trim(),
      }));

      // Separar personajes en vivos y muertos
      this.vivos = this.characters.filter(
        (character) => character.estado === 'vivo'
      ).length.toString();
      this.muertos = this.characters.filter(
        (character) => character.estado === 'muerto'
      ).length.toString();
    });
  }

  navegar(ruta: string) {
    this.utils.navegar(ruta);
  }

}
