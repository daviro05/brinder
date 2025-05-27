import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
})
export class DialogComponent implements OnInit {
  isHtmlContent: boolean = false;
  personajes: any[] = []; // Lista de personajes para el select
  personajeSeleccionado: any; // Personaje seleccionado

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      message: string;
      showCancel?: boolean;
      medalla?: any;
      objeto?: any;
      personajes?: any[]; // Agregado para recibir personajes en caso de bomba
    }
  ) {
    // Evitar cerrar el diálogo con clics fuera o con Escape
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    // Detectar si el mensaje contiene HTML
    this.isHtmlContent =
      typeof this.data.message === 'string' &&
      /<\/?[a-z][\s\S]*>/i.test(this.data.message);

    // Si hay personajes en los datos, asignarlos
    if (this.data.personajes) {
      this.personajes = this.data.personajes;
    }
  }

}
