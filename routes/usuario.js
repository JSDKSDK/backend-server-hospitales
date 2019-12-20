//importaciones
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var app = express();
var Usuario = require('../models/usuario');
var mdAutenticacion=require('../middlewares/autenticacion');


//====================================
//Obtener todos los usuarios
//====================================
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role')//query de mongo
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Usuarios de la BD',
                        errors: err
                    })
                }
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                })
            })


});



//====================================
//Actualizar Usuario    
// //====================================
app.put('/:id',mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Usuario en la BD',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id' + id + 'no existe en la BD',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al Actualizar Usuario en la BD',
                    errors: err
                })
            }
            usuarioGuardado.password=':)';
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });

    });

});

//====================================
//Crear un nuevo usuario
//====================================
app.post('/',mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });
    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear Usuario en la BD',
                errors: err
            })
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken:req.usuario
        });

    });
})

//====================================
//Borrar un Usuario por ID
//====================================

app.delete('/:id',mdAutenticacion.verificaToken,(req,res)=>{
    var id=req.params.id;
    Usuario.findByIdAndDelete(id,(err,usuarioBorrado)=>{
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar Usuario en la BD',
                errors: err
            })
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el usuario en la BD',
                errors: {message:'No existe el usuario en la BD'}
            })
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioBorrado
        });
    })
});

module.exports = app;