//importaciones
var express = require('express');
var app = express();
var Hospital = require('../models/Hospital');
var mdAutenticacion=require('../middlewares/autenticacion');


//====================================
//Obtener todos los Hospitales
//====================================
app.get('/', (req, res, next) => {
    let desde=req.query.desde || 0;
    desde=Number(desde);
    Hospital.find({},)//query de mongo
    .skip(desde)
    .limit(5)
    .populate('usuario','nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Hospitales de la BD',
                        errors: err
                    })
                }
                Hospital.count({},(err,conteo)=>{

                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total:conteo
                    });
                });
            })
});

//====================================
//Actualizar Hospital    
// //====================================
app.put('/:id',mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Hospital en la BD',
                errors: err
            });
        } 

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El Hospital con el id' + id + 'no existe en la BD',
                errors: { message: 'No existe un Hospital con ese ID' }
            });
        }
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

       

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al Actualizar Hospital en la BD',
                    errors: err
                })
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });

    });

});

//====================================
//Crear un nuevo Hospital
//====================================
app.post('/',mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });
    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear Hospital en la BD',
                errors: err
            })
        }
        res.status(201).json({
            ok: true,
            Hospital: hospitalGuardado
        });

    });
})

//====================================
//Borrar un Hospital por ID
//====================================

app.delete('/:id',mdAutenticacion.verificaToken,(req,res)=>{
    var id=req.params.id;
    Hospital.findByIdAndDelete(id,(err,hospitalBorrado)=>{
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar Hospital en la BD',
                errors: err
            })
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el Hospital en la BD',
                errors: {message:'No existe el Hospital en la BD'}
            })
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalBorrado
        });
    })
});

module.exports = app;