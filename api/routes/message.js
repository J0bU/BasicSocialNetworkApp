'use strict'

const express = require('express');

//Destructuración útil para las funciones por controlador.
let {
  saveMessage,
  getReceivedMessages,
  getEmittMessages,
  getUnviewedMessages,
  setViewedMessages

} = require('../controllers/message.js');


const { ensureAuth } = require('../middlewares/authenticated');

let api = express.Router();

  
api.post('/saveMessage',[ensureAuth] , saveMessage);
api.get('/getReceivedMessages', [ensureAuth], getReceivedMessages);
api.get('/getEmittMessages', [ensureAuth], getEmittMessages);
api.get('/getUnviewedMessages', [ensureAuth], getUnviewedMessages);
api.get('/setViewedMessages', [ensureAuth], setViewedMessages);
// api.delete('/deleteFollow/:id', [ensureAuth], deleteFollow);
// api.get('/getFollowingUsers/:id?/:page?', [ensureAuth], getFollowingUsers);
// api.get('/getFollowedUsers/:id?/:page?', [ensureAuth], getFollowedUsers);
// api.get('/getMyFollows/:followed?', [ensureAuth], getMyFollows);


module.exports = api;