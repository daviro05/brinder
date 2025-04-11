import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrinderComponent } from './brinder/brinder.component';
import { AltaPersonajeComponent } from './admin/alta-personaje/alta-personaje.component';
import { AuthGuard } from './guards/auth.guard';
import { InicioComponent } from './inicio/inicio.component';
import { InfoComponent } from './info/info.component';
import { ListaPersonajesComponent } from './admin/lista-personajes/lista-personajes.component';
import { EditarPersonajeComponent } from './admin/editar-personaje/editar-personaje.component';
import { ContactoComponent } from './contacto/contacto.component';
import { BuzonPersonalComponent } from './buzon-personal/buzon-personal.component';
import { ListaBuzonComponent } from './buzon-personal/lista-buzon/lista-buzon.component';
import { BackendGuard } from './guards/backend.guard';
import { ListaContactoComponent } from './admin/lista-contacto/lista-contacto.component';
import { ListaBuzonAdminComponent } from './admin/lista-buzon-admin/lista-buzon-admin.component';
import { EstadisticasComponent } from './admin/estadisticas/estadisticas.component';
import { AvisosComponent } from './admin/avisos/avisos.component';
import { KillerComponent } from './killer/killer.component';

const routes: Routes = [
  { path: 'inicio', component: InicioComponent }, // Ruta específica para "Inicio"
  { path: 'brinder', component: BrinderComponent, canActivate: [BackendGuard] }, // Ruta específica para "Brinder"
  { path: 'info', component: InfoComponent, canActivate: [BackendGuard] }, // Ruta específica para "Info"
  {
    path: 'buzon',
    canActivate: [BackendGuard],
    children: [
      { path: 'inicio', component: BuzonPersonalComponent }, // Ruta específica para "Buzón"
      { path: 'mensajes', component: ListaBuzonComponent }, // Ruta específica para "Mensajes"
    ],
  },
  {
    path: 'contacto',
    component: ContactoComponent,
    canActivate: [BackendGuard],
  }, // Ruta específica para "Contacto"
  {
    path: 'killer',
    component: KillerComponent,
    canActivate: [BackendGuard],
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, BackendGuard],
    children: [
      { path: '', component: ListaPersonajesComponent }, // Lista de personajes
      { path: 'alta', component: AltaPersonajeComponent }, // Alta de personajes
      { path: 'contacto', component: ListaContactoComponent }, // Lista de mensajes de contacto
      { path: 'buzon', component: ListaBuzonAdminComponent }, // Lista de mensajes de buzón
      { path: 'stats', component: EstadisticasComponent }, // Estadísticas
      { path: 'editar-personaje/:id', component: EditarPersonajeComponent }, // Edición de personajes
      { path: 'avisos', component: AvisosComponent }, // Avisos
    ],
  },
  { path: '**', redirectTo: 'inicio', pathMatch: 'full' }, // Redirección a la ruta específica
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
