'use strict'

//----- Fichero encargado de generar los tokens.
const jwt = require('jsonwebtoken');
//Librería encargada de la creación de fechas.
const moment = require('moment');

require('../config/config');


//Función para generar el token, en este caso se recibe como parámetro el usuario.

function createToken(user) {

    let token = jwt.sign({
        user,
    }, process.env.SEMILLA, { expiresIn: process.env.CADUCIDAD_TOKEN });
    return token;

}
module.exports = {
    createToken
}