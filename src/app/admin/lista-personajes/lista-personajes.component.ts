import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CodigoDialogComponent } from 'src/app/dialog/codigo-dialog/codigo-dialog.component';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { BrinderModel } from 'src/app/shared/brinder.model';
import { MatchModel } from 'src/app/shared/match.model';
import { BrinderService } from 'src/app/shared/services/brinder.service';
import { Utils } from 'src/app/shared/utils';

@Component({
  selector: 'app-lista-personajes',
  templateUrl: './lista-personajes.component.html',
  styleUrls: ['./lista-personajes.component.scss'],
})
export class ListaPersonajesComponent implements OnInit {
  personajes: BrinderModel[] = [];
  matches: MatchModel[] = [];
  utils: Utils;
  tipo: string = 'brinder';
  numeroObjetos: any;

  constructor(
    private brinderService: BrinderService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.utils = new Utils(this.router);
  }

  ngOnInit(): void {
    this.cargarPersonajes();
    this.cargarMatches();
  }

  cargarPersonajes(): void {
    this.brinderService.obtenerPersonajes(this.tipo).subscribe((data) => {
      this.personajes = data; // Orden alfabético
      // Añadir un campo dinámico para contar objetos sin modificar el modelo
      this.personajes.forEach((personaje: any) => {
        this.obtenerObjetos(personaje.id).then((count) => {
          personaje.objetosCount = count; // Campo dinámico
        });
      });
    });
  }

  // Cambiar a async para devolver una promesa con el count
  async obtenerObjetos(id: any): Promise<number> {
    return new Promise((resolve) => {
      this.brinderService.getMisObjetos(id).subscribe({
        next: (data) => {
          const count = data.filter((objeto: any) => objeto.usado === 0).length;
          resolve(count);
        },
        error: () => resolve(0)
      });
    });
  }

  cargarMatches(): void {
    this.brinderService.obtenerMatches(this.tipo).subscribe((data) => {
      this.matches = data.sort((a, b) =>
        a.personaje1_name.localeCompare(b.personaje1_name)
      );
    });
  }

  eliminarPersonaje(id: string): void {
    if (confirm('¿Seguro que quieres eliminar este personaje?')) {
      this.brinderService.borrarPersonaje(id).subscribe(
        () => {
          this.personajes = this.personajes.filter((p) => p.id !== id);
        },
        (error) => {
          console.error('Error al editar al personaje:', error);
          this.openDialog(
            'Error',
            'Hubo un error al editar al personaje. Inténtalo de nuevo o contacta con el Centurión.'
          );
        }
      );
    }
  }

  editarPersonaje(id: string): void {
    this.utils.navegar(`admin/editar-personaje/${id}`);
  }

  openDialog(title: string, message: string) {
    return this.dialog.open(DialogComponent, {
      data: {
        title: title,
        message: message,
      },
    });
  }

  navegar(ruta: string) {
    if (ruta === 'admin/buzon') {
      const dialogRef = this.dialog.open(CodigoDialogComponent, {
        disableClose: true,
        data: { recordar: false, tipo: 'codigo' },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result && result.valor === 'abrakadabra') {
          this.router.navigate(['/admin/buzon']);
        } else {
          this.router.navigate(['/admin']);
        }
      });
    } else {
      this.utils.navegar(ruta);
    }
  }

}
