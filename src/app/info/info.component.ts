import { Component, OnInit } from '@angular/core';
import { Utils } from '../shared/utils';
import { ActivatedRoute, Router } from '@angular/router';
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
  seccionActiva: string = 'disidente';

    audios = [
  { nombre: 'Disidente FM 1', url: 'assets/audios/disidente/Disidente FM 1.mp3' },
  { nombre: 'Disidente FM 2', url: 'assets/audios/disidente/Disidente FM 2.mp3' },
  { nombre: 'Disidente FM 3', url: 'assets/audios/disidente/Disidente FM 3.mp3' },
  { nombre: 'Disidente FM 4', url: 'assets/audios/disidente/Disidente FM 4.mp3' },
  { nombre: 'Disidente FM 5', url: 'assets/audios/disidente/Disidente FM 5.mp3' },
];

audioActual: { nombre: string; url: string } | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private brinderService: BrinderService
  ) {
    this.utils = new Utils(this.router);
    this.route.queryParams.subscribe((params) => {
      const seccion = params['seccion'];
      if (seccion === 'disidente' || seccion === 'noticias') {
        this.seccionActiva = seccion;
      }
    });
  }

  ngOnInit() {
    this.cargarAvisos();
  }

  cargarAvisos() {
    this.brinderService.listarAvisos('brinder').subscribe(
      (avisos) => {
        this.avisos = avisos;
        //console.log('Avisos cargados:', this.avisos);
      },
      (error) => {
        console.error('Error al cargar avisos:', error);
      }
    );
  }

  toggleVisibility() {
    this.isVisible = !this.isVisible;
  }

  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;
    this.router.navigate([], {
      queryParams: { seccion },
      queryParamsHandling: 'merge',
    });
  }

reproducirAudio(index: number) {
  this.audioActual = this.audios[index];
  const player = document.querySelector('audio');
  if (player) {
    player.load(); // Recarga la nueva fuente
    player.play();
  }
}

  descargarPDF() {
    const url = '../assets/presentacion.pdf';
    window.open(url, '_blank');
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
