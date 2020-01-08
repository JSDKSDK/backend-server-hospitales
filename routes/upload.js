
var express =require('express');
var fileUpload = require('express-fileupload');
var fs=require('fs');


var app=express();

//====================================
//Importar los modelos
//====================================

var Usuario=require('../models/usuario');
var Medico=require('../models/usuario');
var Hospital = require('../models/Hospital');


// default options
app.use(fileUpload());

//Rutas
app.put('/:tipo/:id',(req,res,next)=>{
    var tipo =req.params.tipo;
    var id=req.params.id;

    //====================================
    //Tipos de coleccion
    //====================================
    var tiposValidos=['hospitales','medicos','usuarios'];
    if (tiposValidos.indexOf(tipo)<0) {
    return res.status(400).json({
    ok: false,
    mensaje: 'Tipo de coleccion no valida',
    errors: {mensaje:'Tipos de coleccion no es valida'}
    })
    }
    if (!req.files) {
    return res.status(400).json({
    ok: false,
    mensaje: 'Error cargando Archivo',
    errors: {message: 'Debe revisar que el archivo sea compatible'}
    });
    }
//====================================
//Obtener nombre del archivo
//====================================
var archivo=req.files.imagen;
var nombreCortado=archivo.name.split('.');
var extensionArchivo=nombreCortado[nombreCortado.length -1];

//====================================
//Extensiones Validas
//====================================
var extensionesValidas=['png','jpg','gif','jpeg'];
if (extensionesValidas.indexOf(extensionArchivo)<0) {
     return res.status(400).json({
    ok: false,
    mensaje: 'Extension no Válida',
    errors: {message: 'Las extensiones Válidas son '+ extensionesValidas.join(', ')}
    });
}

//====================================
//Nombre archivo personalizado
//====================================
var nombreArchivo= `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

//====================================
//Mover el archivo del temporal a un path
//====================================
var path=`./uploads/${tipo}/${nombreArchivo}`;

archivo.mv(path,err=>{
    if (err) {
    return res.status(500).json({
    ok: false,
    mensaje: 'Error al mover archivo',
    errors: err
    })
    }
    subirPorTipo(tipo,id,nombreArchivo,res);
    // res.status(200).json({
    //     ok:true,
    //     mensaje:'Peticion Realizada Correctamente',
    //     extensionArchivo:extensionArchivo
    // })
});

  
    });

function subirPorTipo(tipo,id,nombreArchivo,res){
        if (tipo==='usuarios') {
                Usuario.findById(id,(err,usuario)=>{
                    if (!usuario) {
                        res.status(400).json({
                        ok: true,
                        message: 'Usuario no existe',
                        errors:{messages:'Usuario no existe'}
                        });
                    }



                    pathViejo='./uploads/usuarios/'+ usuario.img;
                    //====================================
                    //Si existe elimina la imagen anterior
                    //====================================
                    
                    if (fs.existsSync(pathViejo)) {
                        fs.unlinkSync(pathViejo);
                    }
                    usuario.img=nombreArchivo;

                    usuario.save((err,usuarioActualizado)=>{
                        usuarioActualizado.password=':)';
                            return res.status(200).json({
                            ok: true,
                            message: 'Imagen de usuario actualizado',
                            usuario:usuarioActualizado
                            });
                    });
                });
        }
        if (tipo==='medicos') {
            Medico.findById(id,(err,medico)=>{
                if (!medico) {
                    res.status(400).json({
                    ok: true,
                    message: 'Medico no existe',
                    errors:{messages:'Medico+ no existe'}
                    });
                }
                pathViejo='./uploads/medicos/'+ medico.img;
                //====================================
                //Si existe elimina la imagen anterior
                //====================================
                
                if (fs.existsSync(pathViejo)) {
                    fs.unlinkSync(pathViejo);
                }
                medico.img=nombreArchivo;

                medico.save((err,medicoActualizado)=>{
                   
                        return res.status(200).json({
                        ok: true,
                        message: 'Imagen de usuario actualizado',
                        medico:medicoActualizado
                        });
                }); 
            });
            
        }
        if (tipo==='hospitales') {
            Hospital.findById(id,(err,hospital)=>{
                if (!hospital) {
                    res.status(400).json({
                    ok: true,
                    message: 'Hospital no existe',
                    errors:{messages:'Hospital no existe'}
                    });
                } 
                pathViejo='./uploads/hospitales/'+ hospital.img;
                //====================================
                //Si existe elimina la imagen anterior
                //====================================
                
                if (fs.existsSync(pathViejo)) {
                    fs.unlinkSync(pathViejo);
                }
                hospital.img=nombreArchivo;

                hospital.save((err,hospitalActualizado)=>{
                   
                        return res.status(200).json({
                        ok: true,
                        message: 'Imagen de usuario actualizado',
                        hospital:hospitalActualizado
                        });
                });
            });
            
        }
}

module.exports=app;