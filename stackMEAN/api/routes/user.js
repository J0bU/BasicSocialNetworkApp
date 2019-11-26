'use strict'

const express = require('express');
const UserController = require('../controllers/users'); //Se traen las funciones creadas en usuarios.

let api = express.Router();

api.get('/home', UserController.home); //Se creará un servicio en /home
api.get('/prueba', UserController.prueba); //Se creará un servicio en /prueba


module.exports = api;