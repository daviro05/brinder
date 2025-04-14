import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Utils {
  constructor(private router: Router) {}

  navegar(ruta: string) {
    this.router.navigate([`/${ruta}`]);
  }

  getBordeStyle(character: any): { [key: string]: string } | null {
    const color = character?.info_user;
    let borde = this.obtenerColor(color);
    if (color && this.esColorHexadecimal(color)) {
      return { border: `3px solid ${color}` };
    }
    return { border: `3px solid ${borde}` };
  }

  getBordeClaroStyle(character: any): { [key: string]: string } | null {
    const color = character?.info_user;
    let borde = this.obtenerColor(color);
    if (color && this.esColorHexadecimal(color)) {
      return { border: `1px solid white`, backgroundColor: `${color}50` };
    }
    return { border: `1px solid white`, backgroundColor: `${borde}50` };
  }

  obtenerColor(color: any) {
    if (this.esColorHexadecimal(color)) {
      return color;
    }
    let borde = '#5dade2'; // Color por defecto
    switch (color) {
      case 'romantico':
        borde = '#ec7063';
        break;
      case 'amistad':
        borde = '#5dade2';
        break;
      case 'surja':
        borde = '#52be80';
        break;
    }
    return borde;
  }

  esColorHexadecimal(valor: string): boolean {
    return /^#([0-9A-Fa-f]{3}){1,2}$/.test(valor);
  }
}
