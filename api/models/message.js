'use strict'

const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let MessageSChema = new Schema({

    //text: Mensaje que será enviado.
    text: {
        type: String,
        default: 'HELLO WORLD!'
    },
    //viewed: Nos indicará si el mensaje fue visto.
    viewed: {
        type: String,
        default: 'False'
    },

    //created_at: Fecha de creación del mensaje.
    created_at: {
        type: String,
        required: [true, "LA FECHA ES OBLIGATORIA"]
    },

    //emmiter: Usuario que envía el mensaje.
    emitter: { type: Schema.Types.ObjectId, ref: 'User' },
    
    //receiver: Usuario que recibe el mensaje.
    receiver: { type: Schema.Types.ObjectId, ref: 'User' }
});


//En este caso la colección creada en MongoDB tendrá el nombre de messages, sin embargo 
//para hacer referencia al modelo creado sí es necesario usar 'Message'
module.exports = mongoose.model('Message', MessageSChema);