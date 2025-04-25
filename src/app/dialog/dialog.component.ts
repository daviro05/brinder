import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
})
export class DialogComponent implements OnInit {
  isHtmlContent: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      message: string;
      showCancel?: boolean;
      medalla?: any;
    }
  ) {}

  ngOnInit(): void {
    // Detectar si el mensaje contiene HTML
    this.isHtmlContent =
      typeof this.data.message === 'string' && /<\/?[a-z][\s\S]*>/i.test(this.data.message);
  }
}
