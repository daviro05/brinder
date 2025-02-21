import { Component } from '@angular/core';
import { Utils } from '../shared/utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent {
  utils: Utils;
  isVisible: boolean = false;

  constructor(private router: Router) {
    this.utils = new Utils(this.router);
  }

  toggleVisibility() {
    this.isVisible = !this.isVisible;
  }

  descargarPDF() {
    const url = '../assets/presentacion.pdf';
    window.open(url, '_blank');
  }

  navegar(ruta: string) {
    this.utils.navegar(ruta);
  }
}
