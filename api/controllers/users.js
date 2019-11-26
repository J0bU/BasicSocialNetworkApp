'use strict'

//Se declaran las constantes express y app para poder ser usadas en la creación de la ruta.
const express = require('express');
const app = express();

//Se importa el modelo User creado.
let User = require('../models/user');

//Creación ruta GET.
function home(req, res) {
    res.json({
        message: 'GET DESDE HOME'
    });
};

//Creación ruta GET 
function prueba(req, res) {
    res.json({
        message: 'GET DESDE PRUEBA'
    });
};

module.exports = {
    home,
    prueba
}