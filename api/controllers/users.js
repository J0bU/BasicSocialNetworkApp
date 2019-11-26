'use strict'

//Se declaran las constantes express y app para poder ser usadas en la creación de la ruta.
const express = require('express');
const app = express();

//Se importa el modelo User creado.
let User = require('../models/user');

//Librería para cifrar la password
let bcrypt = require('bcrypt');

//Creación ruta GET -> PRÓXIMA A ELIMINAR.
function home(req, res) {
    res.json({
        message: 'GET DESDE HOME'
    });
};

//Creación ruta GET -> PRÓXIMA A ELIMINAR.
function prueba(req, res) {
    res.json({
        message: 'GET DESDE PRUEBA'
    });
};

//Método encargado de registrar un nuevo usuario.

function registerUser(req, res){
	
	//Parámetros que viene desde la petición
	let body = req.body;
	console.log(body);

	//Validación de parámetros
	if(!(body.name && body.surname && body.nick && body.email 
		&& body.password)){

		return res.status(412).json({
			ok: false,
			message: "Todos los campos deben ser necesarios"
		});
	}

	//Instancia modelo User: creación nuevo usuario.

	let user = new User({
		name: body.name,
		surname: body.surname,
		nick: body.nick,
		email: body.email,
		password: bcrypt.hashSync(body.password, 10),
		role: body.role
	});

	// Guardar nuevo usuario en la base de datos.
	user.save( (error, usuarioDB) => {
  
        if(error) {
            return res.status(400).json({
            ok: false,
            error: error
         });
      }

      	if(usuarioDB){
      		 res.status(200).json({
          		ok: true,
         		user: usuarioDB
     		 });	
      	}else{
      		res.status(404).json({
      			ok: false,
      			message: 'No se logró crear el usuario'
      		});
      	}
        
	});
};

//Método encargado del login.
function loginUser(req, res) {

	//Se obtienen las credenciales
	let body = req.body;

	User.findOne({email: body.email}, (error, result) => {

		if (error) {
            return res.status(500).json({
                ok: false,
                error: error
            });
        }

        //No existe el correo especificado.
        if (!result) {
            return res.status(400).json({ 
                ok: false,
                message: "(Usuario) o contraseña incorrectos"
            });
        }

        //No coinciden la password ingresada respecto al usuario encontrado.
        if (!bcrypt.compareSync(body.password, result.password)) { 
            return res.status(400).json({ 
                ok: false,
                message: "Usuario o (contraseña) incorrectos"
            });
        }

        return res.json({
        	ok: true,
        	user: {
        		name: result.name,
        		surname: result.surname,
        		nick: result.nick,
        		email: result.email,
        		role: result.role
        	}
        });

	});
};

module.exports = {
    home,
    prueba,
    registerUser,
    loginUser
}