import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// Después de creadas las variables del routing se establecerán acá para ser usadas.
import { routing, appRoutingProviders } from './app.routing';

// Componentes: Se cargan las componentes creadas.
import { AppComponent } from './app.component';
import { LoginComponent }  from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

@NgModule({
  // En esta variable 'declarations' van todos aquellos componentes que se han creado
  // y además se están exponiendo para uso global.
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent
  ],
  // Se pasan el módulo de configuración de rutas: routing.
  imports: [
    BrowserModule,
    routing
  ],
  // Se añaden a los providers las variables creadas en el routing.
  providers: [
    appRoutingProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
