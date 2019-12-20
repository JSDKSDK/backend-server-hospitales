var mongoose =require('mongoose');
var uniqueValidator=require('mongoose-unique-validator');

var Schema =mongoose.Schema;

//====================================
//para validar los tipos de roles permitidos
//====================================

var rolesValidos={
    values:['ADMIN_ROLE','USER_ROLE'],
    message:'{VALUE} no es un rol permitido'
};

//====================================
//Modelo de los usuarios
//====================================

var usuarioSchema= new Schema({
    nombre:{type:String,require:[true,'El nombre es necesario']},
    email:{type:String,unique:true,require:[true,'El email es necesario']},
    password:{type:String,require:[true,'La contraseña es necesario']},
    img:{type:String,require:false},
    role:{type:String,require:true,default:'USER_ROLE',enum:rolesValidos}
});
usuarioSchema.plugin(uniqueValidator,{message:'{PATH}El email debe de ser unico'});

module.exports =mongoose.model('Usuario',usuarioSchema);
