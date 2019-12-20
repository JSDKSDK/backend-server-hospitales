//importaciones
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var app = express();
var Usuario = require('../models/usuario');

var SEED=require('../config/config').SEED;
//====================================
//login
//====================================
app.post('/',(req,res)=>{
   var body = req.body;

    Usuario.findOne({email:body.email},(err,usuarioDB)=>{

        if (err) {
        return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar Usuario en la BD',
        errors: err
        })}

        

        if (!usuarioDB) {
         
            return res.status(400).json({
            ok: false,
            mensaje: 'Credenciales incorrectas -email',
            errors: err 
            })
             
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
                   
           
            return res.status(400).json({
            ok: false,
            mensaje: 'Credenciales incorrectas -password',
            errors: err
            })
           
        }
        // ====================================
        // crear un token
        // ====================================
        usuarioDB.password=':)';//para no mandar la conraseña en el token
        var token = jwt.sign({usuario:usuarioDB},SEED,{expiresIn:1440})
        
        res.status(201).json({
            ok: true,
            Usuario:usuarioDB,
            token:token,
            id:usuarioDB._id
            });
    });

 

   
    
});






//====================================
//Esto nos exporta este archivo a toda la aplicacion
//====================================

module.exports = app;