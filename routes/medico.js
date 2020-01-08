//importaciones
var express = require("express");
var app = express();
var Medico = require("../models/medico");
var mdAutenticacion = require("../middlewares/autenticacion");

//====================================
//Obtener todos los medicos
//====================================
app.get("/", (req, res, next) => {
  let desde=req.query.desde || 0;
  desde=Number(desde);
  Medico.find({},) //query de mongo
  .populate('usuario','nombre email')
  .populate('hospital'  )
  .skip(desde)
  .limit(5)

    .exec((err, medicos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error cargando medicos de la BD",
          errors: err
        });
      }
      Medico.count({},(err,conteo)=>{

        res.status(200).json({
            ok: true,
            medicos: medicos,
            total:conteo
        });
    });
    });
});

//====================================
//Actualizar Medico
// //====================================
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Medico.findById(id, (err, medico) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar Medico en la BD",
        errors: err
      }); 
    }

    if (!medico) {
      return res.status(400).json({
        ok: false,
        mensaje: "El Medico con el id" + id + "no existe en la BD",
        errors: { message: "No existe un Medico con ese ID" }
      });
    }
    medico.nombre = body.nombre;
    medico.usuario = req.usuario._id;
    medico.hospital = body.hospital;


    medico.save((err, medicoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al Actualizar Medico en la BD",
          errors: err
        });
      }

      res.status(200).json({
        ok: true,
        medico: medicoGuardado
      });
    });
  });
});

//====================================
//Crear un nuevo Medico
//====================================
app.post("/", mdAutenticacion.verificaToken, (req, res) => {
  var body = req.body;

  var medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital:body.hospital
  });
  medico.save((err, medicoGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear Medico en la BD",
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      Medico: medicoGuardado
    });
  });
});

//====================================
//Borrar un Medico por ID
//====================================

app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  Medico.findByIdAndDelete(id, (err, medicoBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al Borrar Medico en la BD",
        errors: err
      });
    }
    if (!medicoBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe el Medico en la BD",
        errors: { message: "No existe el Medico en la BD" }
      });
    }
    res.status(201).json({
      ok: true,
      medico: medicoBorrado
    });
  });
});

module.exports = app;
