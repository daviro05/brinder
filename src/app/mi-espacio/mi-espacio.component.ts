import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CodigoDialogComponent } from '../dialog/codigo-dialog/codigo-dialog.component';
import { DialogComponent } from '../dialog/dialog.component';
import { BrinderService } from '../shared/services/brinder.service';
import { BuzonService } from '../shared/services/buzon.service';
import { Utils } from '../shared/utils';
import { BuzonBaseComponent } from '../buzon-personal/buzon-base/buzon-base.component';
import { BrinderModel } from '../shared/brinder.model';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-mi-espacio',
  templateUrl: './mi-espacio.component.html',
  styleUrls: ['./mi-espacio.component.scss'],
})
export class MiEspacioComponent extends BuzonBaseComponent implements OnInit {
  utils: Utils;
  matches: any[] = [];
  mensajesMatches: any[] = [];
  mejorMatch: any;
  tipo: string = 'brinder';
  seccionActiva: string = 'estadisticas';
  colorSeleccionado: string = '#ffffff'; // Valor inicial en hexadecimal
  tipoConexion: string = 'romantico'; // Valor inicial

  constructor(
    protected override buzonService: BuzonService,
    protected override router: Router,
    protected override dialog: MatDialog,
    protected brinderService: BrinderService
  ) {
    super(buzonService, router, dialog);
    this.utils = new Utils(this.router);
  }

  onCodigoValidado(): void {
    this.brinderService
      .obtenerMatchesPersonaje(this.tipo, this.id!)
      .subscribe((matches) => {
        this.matches = matches.map((match) => ({
          ...match,
        }));
        this.mensajesMatches = matches
          .map((match) => match.mensaje)
          .filter((mensaje) => mensaje !== '');

        // Contar las veces que se realiza cada match
        const matchCounts = matches.reduce((acc, match) => {
          const key = `${match.personaje1_id}-${match.personaje2_id}`;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Obtener el match más realizado
        const mostFrequentMatchKey = Object.keys(matchCounts).reduce(
          (prev, current) => {
            return matchCounts[prev] > matchCounts[current] ? prev : current;
          }
        );

        const [personaje1_id, personaje2_id] = mostFrequentMatchKey
          .split('-')
          .map(Number);
        const mostFrequentMatchCount = matchCounts[mostFrequentMatchKey];
        const personaje1_name = matches.find(
          (match) => match.personaje1_id === personaje1_id
        )?.personaje1_name;
        const personaje2_name = matches.find(
          (match) => match.personaje2_id === personaje2_id
        )?.personaje2_name;

        const mostFrequentMatch = {
          personaje1: personaje1_name,
          personaje2: personaje2_name,
          veces: mostFrequentMatchCount,
        };

        this.mejorMatch = mostFrequentMatch;
      });

    this.brinderService.obtenerPersonaje(this.id!).subscribe((data) => {
      this.personaje = data[0];
      this.colorSeleccionado = this.utils.obtenerColor(
        this.personaje.info_user
      );
      this.comprobarPerfil(this.personaje.info_user);
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

  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;
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
}
