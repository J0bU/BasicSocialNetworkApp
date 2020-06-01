/* Fichero encargado de la creación de rutas para los componentes
es decir, cada componente actuará en función de la ruta que 
tenga establecida */

// Se importan los módulos necesarios para hacer el routing.
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Componentes
import { LoginComponent }  from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

// Creación de la constante encargada de las rutas.
const appRoutes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'login', component: LoginComponent},
  {path: 'registro', component: RegisterComponent}

];

//Se exportan las rutas con la configuración establecida
export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);