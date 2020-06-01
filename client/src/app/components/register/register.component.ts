import { Component, OnInit   } from '@angular/core';


/* Definición del componente:
 1. Selector: Encargado de la generación de una etiqueta tipo <register></register> 
 2. templateUrl: Encargada de hacer uso de la plantilla html creada
 para la utilización de este componente a partir de la variable title */

@Component({
  selector: 'register',
  templateUrl: './register.component.html'
})

export class RegisterComponent implements OnInit {

  //title: Variable con la que se usará el componente en la plantilla html.  
  public title : string;

  //El constructor proporciona una inicialización a la variable title.
  constructor(){
    this.title = 'Regístrate';
  }

  ngOnInit(){
    console.log('Componente de registro cargado...');
  }
}