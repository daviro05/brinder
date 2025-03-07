import { Component, OnInit } from '@angular/core';
import { Utils } from '../shared/utils';
import { Router } from '@angular/router';
import { BrinderService } from '../shared/services/brinder.service';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent implements OnInit {
  utils: Utils;
  isVisible: boolean = false;
  avisos: any[] = [];
  currentAvisoIndex: number = 0;

  constructor(private router: Router, private brinderService: BrinderService) {
    this.utils = new Utils(this.router);
  }

  ngOnInit() {
    this.cargarAvisos();
  }

  cargarAvisos() {
    this.brinderService.listarAvisos('brinder').subscribe(
      (avisos) => {
        this.avisos = avisos;
        console.log('Avisos cargados:', this.avisos);
      },
      (error) => {
        console.error('Error al cargar avisos:', error);
      }
    );
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

  prevAviso() {
    if (this.currentAvisoIndex > 0) {
      this.currentAvisoIndex--;
    }
  }

  nextAviso() {
    if (this.currentAvisoIndex < this.avisos.length - 1) {
      this.currentAvisoIndex++;
    }
  }
}
