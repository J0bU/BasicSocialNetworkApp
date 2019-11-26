'use strict'

const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let MessageSChema = new Schema({

    text: {
        type: String,
        default: 'HELLO WORLD!'
    },
    created_at: {
        type: String,
        required: [true, "LA FECHA ES OBLIGATORIA"]
    },
    emmiter: { type: Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: Schema.Types.ObjectId, ref: 'User' }
});


//En este caso la colección creada en MongoDB tendrá el nombre de messages, sin embargo 
//para hacer referencia al modelo creado sí es necesario usar 'Message'
module.exports = mongoose.model('Message', MessageSChema);