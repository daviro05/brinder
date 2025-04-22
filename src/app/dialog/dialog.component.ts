import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'], // Asegúrate de que está vinculado
})
export class DialogComponent implements OnInit {
  isHtmlContent: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    // Detectar si el mensaje contiene HTML
    this.isHtmlContent =
      this.data.message && /<\/?[a-z][\s\S]*>/i.test(this.data.message);
  }
}
