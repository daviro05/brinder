import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { BrinderComponent } from './brinder/brinder.component';
import { DialogComponent } from './dialog/dialog.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AltaPersonajeComponent } from './admin/alta-personaje/alta-personaje.component';
import { InicioComponent } from './inicio/inicio.component';
import { InfoComponent } from './info/info.component';
import { ListaPersonajesComponent } from './admin/lista-personajes/lista-personajes.component';
import { EditarPersonajeComponent } from './admin/editar-personaje/editar-personaje.component';
import { InfoDialogComponent } from './info-dialog/info-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ContactoComponent } from './contacto/contacto.component';
import { BuzonPersonalComponent } from './buzon-personal/buzon-personal.component';
import { ListaBuzonComponent } from './buzon-personal/lista-buzon/lista-buzon.component';
import { CodigoDialogComponent } from './dialog/codigo-dialog/codigo-dialog.component';
import { DialogSimpleComponent } from './dialog/dialog-simple/dialog-simple.component';
import { ListaContactoComponent } from './admin/lista-contacto/lista-contacto.component';
import { ListaBuzonAdminComponent } from './admin/lista-buzon-admin/lista-buzon-admin.component';
import { EstadisticasComponent } from './admin/estadisticas/estadisticas.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { AvisosComponent } from './admin/avisos/avisos.component';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    BrinderComponent,
    DialogComponent,
    AltaPersonajeComponent,
    InicioComponent,
    InfoComponent,
    ListaPersonajesComponent,
    EditarPersonajeComponent,
    InfoDialogComponent,
    ContactoComponent,
    BuzonPersonalComponent,
    ListaBuzonComponent,
    CodigoDialogComponent,
    DialogSimpleComponent,
    ListaContactoComponent,
    ListaBuzonAdminComponent,
    EstadisticasComponent,
    AvisosComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
    BrowserAnimationsModule,
    MatMenuModule,
    MatDividerModule,
    MatSelectModule,
    DragDropModule,
    MatCheckboxModule,
    ClipboardModule,
    MatExpansionModule,
    SharedModule,
  ],
  exports: [DialogSimpleComponent],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
