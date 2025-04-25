import {
  Component,
  Inject,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-mensajes-dialog',
  templateUrl: './mensajes-dialog.component.html',
  styleUrls: ['./mensajes-dialog.component.scss'],
})
export class MensajesDialogComponent implements AfterViewInit {
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<MensajesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mensajes: any[] }
  ) {}

  ngAfterViewInit(): void {
    // Asegurarse de que el contenedor esté en la parte superior
    if (this.chatContainer) {
      this.chatContainer.nativeElement.scrollTop = 0;
    }
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
