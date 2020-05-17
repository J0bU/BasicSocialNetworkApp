'use strict'

/*
  ############ SISTEMA USUARIOS ############
  Controlador encargado de manejar la lógica de usuarios,
*/

//Se declaran las constantes express y app para poder ser usadas en la creación de la ruta.
const express = require('express');
const app = express();

//Libería encargada de realizar el sign del token.
const jwt = require('../services/jwt');

//Librería para cifrar la password
const bcrypt = require('bcrypt');

//Librería que ayudará a decidir los campos a actualizar.
const underscore = require('underscore');

//Librería encargadad de realizar la paginación de mongoose.
const mongoosePagination = require('mongoose-pagination');

//Librería que nos permite trabajar con ficheros.
const fs = require('fs');

//Librería que nos permitirá trabajar con rutas de ficheros.
const path = require('path');

//Se importa el modelo User creado.
const User = require('../models/user');
//Se importa el modelo Follow creado.
const Follow = require('../models/follow.js');
//Se importa el modelo Publication creado.
const Publication = require('../models/publication');


// --------- Método encargado de registrar un nuevo usuario --------
function registerUser(req, res) {

  //Parámetros que viene desde la petición
  let body = req.body;

  //Validación de parámetros
  if (!(body.name && body.surname && body.nick && body.email &&
          body.password)) {

    return res.status(412).json({
        ok: false,
        statusCode: 412,
        message: "Todos los campos deben ser necesarios"
    });
  }

  //Instancia modelo User: creación nuevo usuario.
  let user = new User({
    name: body.name,
    surname: body.surname,
    nick: body.nick,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    role: body.role
  });

  // Guardar nuevo usuario en la base de datos.
  user.save((error, usuarioDB) => {

    if (error) return res.status(500).json({ok: false,statusCode: 500,error: error });
    

    if (usuarioDB) {
        return res.status(200).json({
          ok: true,
          statusCode: 200,
          user: usuarioDB
        });
    } else {
        return res.status(404).json({
          ok: false,
          statusCode: 404,
          message: 'No se logró crear el usuario'
        });
      }

  });

};

//------------Método encargado del login------------
function loginUser(req, res) {

  //Se obtienen las credenciales
  let body = req.body;

  //Se busca en el modelo por email ya que debe ser único.
  User.findOne({ email: body.email }, (error, user) => {

    if (error) {
        return res.status(500).json({
            ok: false,
            statusCode: 500,
            error: error
        });
    }

    //No existe el correo especificado.
    if (!user) {
        return res.status(404).json({
            ok: false,
            statusCode: 404,
            message: "(Usuario) o contraseña incorrectos"
        });
    }

    //No coinciden la password ingresada respecto al usuario encontrado.
    if (!bcrypt.compareSync(body.password, user.password)) {
        return res.status(400).json({
            ok: false,
            statusCode: 400,
            message: "Usuario o (contraseña) incorrectos"
        });
    }

    //Usando tokens para la autenticación: se pasan todos los filtros anteriores.
    return res.json({
        ok: true,
        user: user,
        token: jwt.createToken(user) //Función encargada de disparar el middleware.
    });

    });
};

//---------Método encargado de conseguir los datos de un usuario--------
function getUser(req, res) {

  let id = req.params.id;
  User.findById(id, (error, user) => {

    if (error) {
        return res.status(500).json({
            ok: false,
            statusCode: 500,
            error: error
        });
    }

    //No existe el correo especificado.
    if (!user) {
        return res.status(404).json({
            ok: false,
            statusCode: 404,
            message: "No existe un usuario con el id especificado"
        });
    }

    //Se revisa la existencia del seguimiento del usuario pasado como
    //parámetro contra el usuario logueado.

    /*Debido a que es una promesa que está realizada en la función 
    FollowThisUser con async y await, retornará una promea que
    se captura con then y then traréra consigo el valor retornado de la 
    función FollowThisUser.*/
    followThisUser(req.userToken._id, id).then((value) => {
      //Usando tokens para la autenticación.
      return res.json({
          ok: true,
          statusCode: 200,
          user: user,
          following: value.yoSigo,
          followed: value.elSigue
      });
    }).catch(error => {console.log(error)});

  }); 
};

/*
  ----- Creación de una función asíncrona ----
  1. Creación de la función que contendrá la funcionalidad
  en este caso followThisUser, a la función se le agregará
  la palabra reservada async.

  2. Se crea una variable que contendrá el resultado de la ejecución
  de la función interna, en este caso fue llamada following, por lo que
  se esperará a obtener el return y se almacenará allí.
*/

async function followThisUser(identity_user_id, user_id){

  //Se revisa la existencia del seguimiento del usuario pasado como
  //parámetro contra el usuario logueado.

  //Following: Yo sigo al usuario.
   var following = await Follow.findOne({user: identity_user_id, followed:user_id})
  .populate('followed')
  .exec().then((followsDB ) => {
  
    
    if(!followsDB)
      return {ok: false,statusCode: 404,message: 'No sigues a este usuario aún'};

    //Usando tokens para la autenticación.
    return  followsDB;

  }).catch(error => {if(error) throw new Error({ok: false,statusCode: 500,error: error});})

  //Followed: El usuario me sigue.
  var followed = await Follow.findOne({user: user_id, followed:identity_user_id})
  .populate('followed')
  .exec().then(( followsDB) => {

    
    if(!followsDB)
      return {ok: false,statusCode: 404,message: 'Este usuario no te sigue.'};
    

    //Usando tokens para la autenticación.
    return followsDB;

  }).catch(error => {if(error) throw new Error({ok: false,statusCode: 500,error: error});})

  return {
    yoSigo: following,
    elSigue: followed
  }
  //Este método retornará una promesa.
   
};

//-------Método encargado de devolver un listado de usuarios paginados-----
function getUsers(req, res) {

  //Obtenemos el id del usuario que traerá el token.
  let identityUserId = req.userToken._id;

  //let page = 1 sólo se usa en caso de que el usuario no indique la página.
  let page = 1;
  if (req.params.page) {
      page = req.params.page;
  }

  let itemsPerPage = 2;
  User.find().sort('_id').paginate(page, itemsPerPage, (error, users, total) => {

    if (error) {
        return res.status(500).json({
            ok: false,
            statusCode: 500,
            error: error
        });
    }

    if (!users) {
        return res.status(404).json({
            ok: false,
            statusCode: 404,
            message: "No hay usuarios disponibles"
        });
    }

    followsUserIds(identityUserId).then((value) => {

      return res.json({
          ok: true,
          statusCode: 200,
          users,
          users_following: value.following,
          users_follow_me: value.followed,
          total,
          pages: Math.ceil(total / itemsPerPage)
      });

    }).catch(error => {console.log(error)});

  });

}

// -- Creación de función asíncrona getUsers: Usuarios que me siguen y sigo. -----
let followsUserIds = async (user_id) => {

  let following = await Follow.find({user: user_id}).select({'_id':0,'__v0':0,'user':0})
  .exec().then((followsDB) => {


    let follows_clean = [];
    followsDB.forEach((follows) => {

        follows_clean.push(follows.followed);
    });

    if(follows_clean.length === 0)
      return {ok: false,statusCode: 404,message: 'No sigues a ningún usuario'};

    return follows_clean;

  }).catch(error => {if(error) throw new Error({ok: false,statusCode: 500,error: error});});

   let followed = await Follow.find({followed: user_id}).select({'_id':0,'__v0':0,'followed':0})
  .exec().then((followsDB) => {


    let follows_clean = [];
    followsDB.forEach((follows) => {

        follows_clean.push(follows.user);
    });

    if(follows_clean.length === 0)
      return {ok: false,statusCode: 404,message: 'Aún nadie te sigue'};

    return follows_clean;
    
  }).catch(error => {if(error) throw new Error({ok: false,statusCode: 500,error: error});});

  return {
    following,
    followed
  }
};

//Método encargado de mostrar estadísticas
//Cuánta gente nos sigue, cuánta gente estamos siguiendo.
let getCounters = (req, res) => {

  let userId = req.userToken._id;
  if(req.params.id)
    userId = req.params.id;

  getCountFollow(userId).then( (value) => {
    return res.json({ok:true, statusCode: 200,value});
  }).catch(error => {console.log(error)});

};

//Función asíncrona que soluciona el problema de la función anterior.
let getCountFollow = async (user_id) => {

  let following = await Follow.countDocuments({user:user_id})
  .exec().then( count => {

    return count;
  }).catch(error => {if(error) throw new Error({ok: false,statusCode: 500,error: error});});

  let followed = await Follow.countDocuments({followed:user_id})
  .exec().then( count => {

    return count;
  }).catch(error => {if(error) throw new Error({ok: false,statusCode: 500,error: error});});
 
  let publications = await Publication.countDocuments({user: user_id}).exec().then(count => {

    return count;
  }).catch(error => {if(error) throw new Error({ok: false,statusCode: 500,error: error});});
  
  return {
    following: following,
    followed: followed,
    publications: publications
  }


};
//------Método encargado de actualizar los datos de un usuario-----

function updateUser(req, res) {

  //Obtenemos el id del usuario que traerá el token.
  let identityUserId = req.userToken._id;

  let idUser = req.params.id;

  if (identityUserId != idUser) {
      return res.status(403).json({
          ok: false,
          message: 'No tiene permisos para actualizar este usuario'
      });
  }

  //Decidir los campos a actualizar del usuario.
  let body = underscore.pick(req.body, ["name", "image", "role", "email", "nick"]);

  User.findByIdAndUpdate(idUser, body, { new: true, runValidators: true, context: 'query' }, (error, userUpdate) => {

    if (error) {
        return res.status(500).json({
            ok: false,
            statusCode: 500,
            error: error
        });
    }

    if (!userUpdate) {
        return res.status(404).json({
            ok: false,
            statusCode: 404,
            message: 'No se actualizó ningún usuario'
        });
    }

    res.json({
        ok: true,
        statusCode: 200,
        user: userUpdate
    });

  });
};

//---------Subir archivos de imagen_avatar_usuario-----
function uploadImage(req, res) {

  //Obtenemos el id del usuario que traerá el token.
  let identityUserId = req.userToken._id;
  let idUser = req.params.id;
  
  if (req.files || Object.keys(req.files).length !== 0) {
    
    //Se obtiene la ruta en donde se están almacenando las imágenes
    let filePath = req.files.image.path;
    
    let fileSplit = req.files.image.path.split('\\');
    
    //Se genera un arreglo con las divisiones de cada una de las rutas
    //además se obtiene el nombre del archivo.
    let fileName = fileSplit[2];
    
    let extSplit = fileName.split('\.');
    
    let fileExt = extSplit[1];
    
    //Extensiones válidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    
    if (identityUserId != idUser) {
     return  removeFilesOfUploads(res,filePath, `No tienes permiso para actualizar los datos del usuario`);
      //se hace la validación de las extensiones.
    }
    
    if(extensionesValidas.indexOf(fileExt) >= 0){

        User.findByIdAndUpdate(idUser, {image: fileName}, {new: true}, (error, userUpdate) => {

        if (error) return res.status(500).json({ok: false,statusCode: 500,error: error});
    
        if (!userUpdate) return res.status(404).json({ok: false,statusCode: 404,message: 'No se actualizó ningún usuario'});

        return res.json({
          ok: true,
          statusCode: 200,
          user: userUpdate
      });

    });
    }else{

      return removeFilesOfUploads(res,filePath, `Las extensiones permitidas son; ${extensionesValidas.join(',')}`);
    }

  }else{
    
    return res.status(412).json({
        ok: false,
        statusCode: 412,
        message: 'No se subió ningún archivo'
    });
  }

};

function removeFilesOfUploads(res, file_path, message){
  fs.unlink(file_path, (error) => {
    return res.status(200).json({
      ok: false,
      message
    });
  });
}
//-----Función encargada de obtener la imágen del usuario ingresado----

function getImageFile(req, res) {

  let imageFile = req.params.imageFile;
  let pathFile = './uploads/users/' + imageFile;

  fs.exists(pathFile, (exists) => {
    if (exists) {
        res.sendFile(path.resolve(pathFile));
    } else {
      res.status(412).json({
          ok: false,
          statusCode: 412,
          message: 'No existe la imagen'
      });
    }
  });
};


module.exports = {
    registerUser,
    loginUser,
    getUser,
    getUsers,
    getCounters,
    updateUser,
    uploadImage,
    getImageFile
}