'use strict'

const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let FollowSChema = new Schema({

    user: { type: Schema.Types.ObjectId, ref: 'User' },
    followed: { type: Schema.Types.ObjectId, ref: 'User' }

});

//En este caso el modelo 'Follow' será creado como una colección en la base de datos como 'follows'.
module.exports = mongoose.model('Follow', FollowSChema);