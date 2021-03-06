//importaciones
var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var app = express();
var SEED = require("../config/config").SEED;

var Usuario = require("../models/usuario");

//Google
var CLIENT_ID = require("../config/config").CLIENT_ID;
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);
//====================================
//AUTENTICACION GOOGLE
//====================================

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  // const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  };
}

//====================================
//Login Google
//====================================
app.post("/google", async (req, res) => {
  var token = req.body.token;

  var googleUser = await verify(token).catch(e => {
    return res.status(403).json({
      ok: false,
      message: "Token no valido"
    });
  });

  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar Usuario en la BD",
        errors: err
      });
    }
    if (usuarioDB) {
       if (usuarioDB.google===false){
        return res.status(400).json({
            ok: false,
            mensaje: "Debe de usar su autenticacion normal",
           
          });
       }else{
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 1440 });

        res.status(201).json({
          ok: true,
          Usuario: usuarioDB,
          token: token,
          id: usuarioDB._id
        });
       }

      }else{
          //====================================
          //El usuario no existe hay que crearlo
          //====================================
          var usuario=new Usuario();
          usuario.nombre=googleUser.nombre;
          usuario.email=googleUser.email;
          usuario.img=googleUser.img;
          usuario.google=true
          usuario.password=':)';


                usuario.save((err,usuarioDB)=>{
                    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 1440 });

                    res.status(201).json({
                      ok: true,
                      Usuario: usuarioDB,
                      token: token,
                      id: usuarioDB._id
                    });
                });
      }
  });
  // res.status(200).json({
  // ok: true,
  // message: 'OK!!',
  // googleUser:googleUser
  // });
});

module.exports = app;
//====================================
//login Normal
//====================================
app.post("/", (req, res) => {
  var body = req.body;

  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar Usuario en la BD",
        errors: err
      });
    }

    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        mensaje: "Credenciales incorrectas -email",
        errors: err
      });
    }
    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        mensaje: "Credenciales incorrectas -password",
        errors: err
      });
    }
    // ====================================
    // crear un token
    // ====================================
    usuarioDB.password = ":)"; //para no mandar la conraseña en el token
    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 1440 });

    res.status(201).json({
      ok: true,
      Usuario: usuarioDB,
      token: token,
      id: usuarioDB._id
    });
  });
});

//====================================
//Esto nos exporta este archivo a toda la aplicacion
//====================================

module.exports = app;
