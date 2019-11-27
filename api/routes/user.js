'use strict'

const express = require('express');
const {
    home,
    prueba,
    registerUser,
    loginUser,
    getUser,
    getUsers,
    updateUser
} = require('../controllers/users'); //Se traen las funciones creadas en usuarios.

const { ensureAuth } = require('../middlewares/authenticated');

let api = express.Router();

api.get('/home', home); //Se creará un servicio en /home
api.get('/prueba', ensureAuth, prueba); //Se creará un servicio en /prueba
api.post('/registerUser', registerUser);
api.post('/loginUser', loginUser);
api.get('/getUser/:id', ensureAuth, getUser);
api.get('/getUsers/:page?', ensureAuth, getUsers);
api.put('/updateUser/:id', ensureAuth, updateUser);

module.exports = api;