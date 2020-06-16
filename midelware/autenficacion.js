var jwt = require("jsonwebtoken");
var SEED = require('../config/config').SEED;


//====================================
// Verificar Token
//====================================

exports.verificarToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: ' Token no válido',
                errors: err
            });
        }

        req.usuario = decoded.usuario;


        next();
    });
};
//====================================
// Verificar ADMIN_ROLE
//====================================

exports.verificarADMIN_ROLE = function(req, res, next) {

    var usuario = req.usuario;

    if( usuario.role === 'ADMIN_ROLE' ){
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false, 
            mensaje: 'Token incorrecto - No es administrador', 
            errors: { message: 'No es administrador' }
        });
    }
};
//========================================
// Verificar ADMIN_ROLE o mismo Usuario
//========================================

exports.verificarADMIN_ROLE_o_MismoUsuario = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if( usuario.role === 'ADMIN_ROLE' || usuario._id === id  ){
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false, 
            mensaje: 'Token incorrecto - No es administrador', 
            errors: { message: 'No es administrador' }
        });
    }
};