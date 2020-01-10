'use strict'
/*
---Esta instrucción permitirá usar nuevas características de JavaScript ----
además nos permitirá usar ES5, además de usar funciones de flecha y demás.
*/

//Se trae la configuración realizada en app.js y exportada, por lo que se podrá usar acá.
const app = require('./app');
//Se carga la librería de mongoose.
const mongoose = require('mongoose');

//Import config
require('./config/config');

//Creación del servidor usando Express.
mongoose.connect('mongodb://localhost:27017/curso_mean_social', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}, (error, resp) => {
    if (error) throw error; //Lanazará error si no logra conectarse a la db.
    else {
        console.log("DB ONLINE");
        app.listen(process.env.PORT, () => {
            console.log("EscuchandoPuerto", process.env.PORT);
        });
    }
});