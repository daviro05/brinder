import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as d3 from 'd3';
import { BrinderModel } from 'src/app/shared/brinder.model';
import { BrinderService } from 'src/app/shared/services/brinder.service';
import { Utils } from 'src/app/shared/utils';

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.scss'],
})
export class EstadisticasComponent implements OnInit {
  matches: any[] = [];
  personajes: BrinderModel[] = [];
  personajeStats: any[] = [];
  totalMatches: number = 0;
  tipo: string = 'brinder';
  @ViewChild('chart') private chartContainer: ElementRef | undefined;
  utils: Utils;

  modoVista: 'estadisticas' | 'mensajes' = 'estadisticas';

  constructor(private brinderService: BrinderService, private router: Router) {
    this.utils = new Utils(this.router);
  }

  ngOnInit(): void {
    this.cargarPersonajes();
    this.cargarMatches();
  }

  cargarMatches(): void {
    this.brinderService.obtenerMatches(this.tipo).subscribe((data) => {
      this.matches = data.sort((a, b) =>
        a.personaje1_name.localeCompare(b.personaje1_name)
      ); // Orden alfabético
      this.totalMatches = this.matches.length; // Total de matches
      //this.generarGrafico();
      this.calcularEstadisticasPersonajes();
    });
  }

  cargarPersonajes(): void {
    this.brinderService.obtenerPersonajes(this.tipo).subscribe((data) => {
      this.personajes = data;
    });
  }

  generarGrafico(): void {
    const personajeCounts: { [key: string]: number } = {};

    // Contar los matches por personaje
    this.matches.forEach((match) => {
      personajeCounts[match.personaje1_name] =
        (personajeCounts[match.personaje1_name] || 0) + 1;
      personajeCounts[match.personaje2_name] =
        (personajeCounts[match.personaje2_name] || 0) + 1;
    });

    const personajes = Object.keys(personajeCounts);
    const counts = personajes.map((personaje) => personajeCounts[personaje]);

    // Crear el gráfico de barras con D3
    const svg = d3
      .select(this.chartContainer?.nativeElement)
      .append('svg')
      .attr('width', 600)
      .attr('height', 400);

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const x = d3.scaleBand().domain(personajes).range([0, width]).padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(counts) || 0])
      .nice()
      .range([height, 0]);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.selectAll('.bar')
      .data(counts)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => x(personajes[i]) || 0)
      .attr('y', (d) => y(d))
      .attr('width', x.bandwidth())
      .attr('height', (d) => height - y(d));

    g.append('g')
      .selectAll('.x-axis')
      .data([personajes])
      .enter()
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append('g').call(d3.axisLeft(y));
  }

  calcularEstadisticasPersonajes(): void {
    const personajeCounts: { [key: string]: number } = {};

    // Inicializar todos los personajes con 0 matches
    this.personajes.forEach((personaje) => {
      personajeCounts[personaje.name] = 0;
    });

    // Contar los matches por personaje
    this.matches.forEach((match) => {
      personajeCounts[match.personaje1_name] =
        (personajeCounts[match.personaje1_name] || 0) + 1;
      personajeCounts[match.personaje2_name] =
        (personajeCounts[match.personaje2_name] || 0) + 1;
    });

    // Crear un array con las estadísticas de cada personaje
    this.personajeStats = this.personajes.map((personaje) => {
      const count = personajeCounts[personaje.name] || 0;
      const porcentaje =
        this.totalMatches > 0 ? (count / this.totalMatches) * 100 : 0;
      return {
        personaje: personaje.name,
        matches: count,
        porcentaje: porcentaje.toFixed(2),
      };
    });

    // Ordenar personajes por cantidad de matches (descendente)
    this.personajeStats.sort((a, b) => b.matches - a.matches);
  }

  cambiarVista(modo: 'estadisticas' | 'mensajes'): void {
    this.modoVista = modo;
  }

  ordenActual: string = ''; // Campo actual de ordenación
  ordenAscendente: boolean = true; // Por defecto, orden ascendente

  ordenarPor(lista: any[], campo: string): void {
    if (this.ordenActual === campo) {
      this.ordenAscendente = !this.ordenAscendente; // Alternar orden
    } else {
      this.ordenActual = campo;
      this.ordenAscendente = true; // Nuevo campo, se empieza en ascendente
    }

    lista.sort((a, b) => {
      let valorA = a[campo];
      let valorB = b[campo];

      if (campo === 'created_at') {
        // Si es una fecha, convertir a timestamp para ordenar correctamente
        valorA = new Date(valorA).getTime();
        valorB = new Date(valorB).getTime();
        return this.ordenAscendente ? valorA - valorB : valorB - valorA;
      } else if (!isNaN(parseFloat(valorA)) && !isNaN(parseFloat(valorB))) {
        // Si son números, comparar numéricamente
        return this.ordenAscendente ? valorA - valorB : valorB - valorA;
      } else {
        // Si son strings, usar localeCompare con "base" para ignorar tildes
        return this.ordenAscendente
          ? valorA.localeCompare(valorB, 'es', { sensitivity: 'base' })
          : valorB.localeCompare(valorA, 'es', { sensitivity: 'base' });
      }
    });
  }
}
