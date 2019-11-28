'use strict'

const jwt = require('jsonwebtoken');
require('../config/config');


//Next: saltar a las próximas funcionalidades.
let ensureAuth = (req, res, next) => {

    let token = req.headers.token;
    if (!token) {
        return res.status(402).json({
            ok: false,
            message: 'Necesita autenticación para continuar'
        });
    }

    jwt.verify(token, process.env.SEMILLA, (error, decoded) => {

        if (error) {
            return res.status(401).json({
                ok: false,
                error: {
                    message: `Token no válido: ${error.message}`,
                }
            });


        }

        //En este caso 'userToken' es un objeto que contendrá la
        //información del objeto al cual acabamos de convertir el token.
        req.userToken = decoded.user;

    });

    next();
}

module.exports = {
    ensureAuth
}