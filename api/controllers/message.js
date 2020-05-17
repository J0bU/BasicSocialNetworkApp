'use strict'
/*
  ############ SISTEMA MENSAJES ############
  Controlador encargado de manejar la lógica de mensajes,
*/

//Manejar fechas.
const moment = require('moment'); 

//Manejar paginación.
const mongoosePaginate = require('mongoose-pagination'); 

// Modelos MongoDB
const User = require('../models/user.js');
const Follow = require('../models/follow.js');
const Message = require('../models/message.js');


// Método encargado de la creación de un mensaje.

function saveMessage(req, res){

  let body = req.body;

  if(!body.text || !body.receiver){
    return res.status(401).json({
      ok: false, 
      statusCode: 401,
      error: 'Envía los datos necesarios'
    });
  }

  let message = new Message({
    text: body.text,
    created_at: moment().unix(),
    emitter: req.userToken._id,
    receiver: body.receiver
  });

  message.save((error, messageDB) => {

     if (error) return res.status(500).json({ok: false, statusCode: 500,error: error });

     if (messageDB) {
        return res.status(200).json({
          ok: true,
          statusCode: 200,
          user: messageDB
        });
    } else {
        return res.status(404).json({
          ok: false,
          statusCode: 404,
          message: 'No se logró crear el mensaje'
        });
      }
  });

};

// Método encargado de mostrar los mensajes recibidos.

function getReceivedMessages(req,res){

  let userId = req.userToken._id;
  let page = 1;
  if(req.body.page) page = req.body.page;
  let itemsPerPage = 4;

  Message.find({receiver:userId}).populate('emitter','name surname nick _id image').paginate(page, itemsPerPage, (error, messages, total) => {

    if (error) return res.status(500).json({ok: false, statusCode: 500,error: error });

    if(!messages) return res.status(404).json({ok:false, statusCode: 404, error: 'No hay mensajes'});

    return res.status(200).json({
      total: total,
      pages: Math.ceil(total/itemsPerPage),
      messages
    });

  });

};

// Método encargado de mostrar los mensajes enviados.

function getEmittMessages(req, res){

  let userId = req.userToken._id;
  let page = 1;
  if(req.body.page) page = req.body.page;
  let itemsPerPage = 4;

  Message.find({emitter:userId}).populate('receiver','name surname nick _id image').paginate(page, itemsPerPage, (error, messages, total) => {

    if (error) return res.status(500).json({ok: false, statusCode: 500,error: error });

    if(!messages) return res.status(404).json({ok:false, statusCode: 404, error: 'No hay mensajes'});

    return res.status(200).json({
      total: total,
      pages: Math.ceil(total/itemsPerPage),
      messages
    });

  });

};

// Método encargado de mostrar los mensajes no leídos.

function getUnviewedMessages(req, res){

  let userId = req.userToken._id;
  Message.countDocuments({receiver:userId, viewed:'False'}).exec((error, count) => {

    if (error) return res.status(500).json({ok: false, statusCode: 500,error: error });

    return res.json({
      ok: true,
      statusCode: 200,
      unviewed: count
    });

  });

};

// Actualizar mensajes leídos.

function setViewedMessages(req, res){

  let userId = req.userToken._id;

  Message.updateMany({receiver:userId, viewed:'False'}, {viewed:'True'}, {'multi': true}, (error, updatedMessages) => {

    if (error) return res.status(500).json({ok: false, statusCode: 500,error: error });

    if(!updatedMessages) return res.status(404).json({ok:false, statusCode:404, error: 'No hay mensajes sin leer'});

    return res.json({
      ok:true,
      statusCode: 200,
      updatedMessages: updatedMessages
    });

  });

};

module.exports = {
  saveMessage,
  getReceivedMessages,
  getEmittMessages,
  getUnviewedMessages,
  setViewedMessages
}