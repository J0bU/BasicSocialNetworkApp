'use strict'

// ====================
// PUERTO = DEFINIR VARIABLES GLOBABLES
//====================

process.env.PORT = process.env.PORT || 3000;


// ====================
// SEMILLA DE AUTENTICACIÓN
//====================

process.env.SEMILLA = process.env.SEMILLA || 'stackMEAN_secret_key';

// ====================
// VENCIMIENTO DE TOKEN
//====================

process.env.CADUCIDAD_TOKEN = '48h';