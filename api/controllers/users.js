'use strict'

//Se declaran las constantes express y app para poder ser usadas en la creación de la ruta.
const express = require('express');
const app = express();

//Se importa el modelo User creado.
const User = require('../models/user');

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




// --------- Método encargado de registrar un nuevo usuario --------
function registerUser(req, res) {

  //Parámetros que viene desde la petición
  let body = req.body;
  console.log(body);

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

    if (error) {
        return res.status(500).json({
          ok: false,
          statusCode: 500,
          error: error

        });
    }

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

    //Usando tokens para la autenticación.
    return res.json({
        ok: true,
        statusCode: 200,
        user: user,
    });



  });
}

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

    res.json({
        ok: true,
        statusCode: 200,
        users,
        total,
        pages: Math.ceil(total / itemsPerPage)
    });

  });

}
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

  if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(412).json({
          ok: false,
          statusCode: 412,
          message: 'No se subió ningún archivo'
      });
  }
  //Se obtiene la ruta en donde se están almacenando las imágenes
  let filePath = req.files.image.path;

  //Extensiones válidas
  let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
  //Se genera un arreglo con las divisiones de cada una de las rutas
  //además se obtiene el nombre del archivo.
  let fileName = req.files.image.name.split('.');

  var fileNameNoV = req.files.image.path.split('\\')[2];

  //Por último se obtiene la extensión de la imagen subida.
  let extImge = fileName[fileName.length - 1];

  //Se pregunta si el id que viene desde el token es igual al proporcionado.
  if (identityUserId != idUser) {
    let eliminar = fs.unlink(filePath, (error) => {
        if (error) { return res.status(400).json({ ok: false, message: 'no fue posible eliminar el archivo', error }) }
        res.status(403).json({ ok: false, message: 'No tiene permisos para realizar esta acción' });
    });

    return eliminar;
    //se hace la validación de las extensiones.
  }
  if (extensionesValidas.indexOf(extImge) < 0) {
    return fs.unlink(filePath, (error) => {
      res.status(400).json({
        ok: false,
        error: {
          message: 'Las extensiones permitidas son ' + extensionesValidas.join(',')
        }
      });
    });

  }

  //Se busca el usuario para obtener la imagen que ya tiene asignada y borrarla antes 
  //de actualizar la próxima.
  User.findById(idUser, (error, userGet) => {

    if (error) return res.status(500).json({ ok: false, statusCode: 500, error: error });
    if (!userGet) return res.status(404).json({ ok: false, statusCode:404, message: 'no existe un usuario con este id' });

    //Se obtiene el atributo de imagen que viene desde el usuario.
    var imageUser = userGet.image;

    //Se agrega el path del usuario añadiendo la imagen que tiene en la BD.
    let pathFile = './uploads/users/' + imageUser;
    console.log('pathImagenBD:', pathFile);

    fs.exists(pathFile, (exists) => {
      if (exists) {
          fs.unlink(pathFile, (error) => {});
      }
    });

  let actualizaImagen = {
      image: fileNameNoV
  }

    User.findByIdAndUpdate(idUser, actualizaImagen, { new: true }, (error, userImageUpdate) => {

      if (error) {
        return res.status(500).json({
          ok: false,
          statusCode: 500,
          error: error
        });
      }

      if (!userImageUpdate) {
        return res.status(404).json({
          ok: false,
          statusCode: 404,
          message: 'No se actualizó ningún usuario'
        });
      }

      res.json({
          ok: true,
          statusCode: 200,
          user: userImageUpdate
      });

          
    });
  });
};


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
    updateUser,
    uploadImage,
    getImageFile
}