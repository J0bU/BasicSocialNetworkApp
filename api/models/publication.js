'use strict'

const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let PublicationSchema = new Schema({

    text: {
        type: String,
        default: "HELLO WORLD!"
    },
    file: {
        type: String,
        required: false
    },
    create_at: {
        type: String,
        required: [true, "LA FECHA ES OBLIGATORIA"]
    },
    //En este caso la columna 'user' será el usuario que realizó la publicación, para ello es necesario
    // además hacer referencia a la colección Users que desde el esquema de mongoose se llamó 'User',
    // por esta razón se pasa como argumento 'ref: 'User'' haciendo referencia a dicha colección creada.
    user: { type: Schema.Types.ObjectId, ref: 'User' }
});


//En la base de datos este modelo tendrá el nombre de publications como colección.
module.exports = mongoose.model('Publication', PublicationSchema);