var express = require("express");
var app = express();
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

var mdAutenficación = require('../midelware/autenficacion');


var Usuario = require("../models/usuario");

// ==============================================================
// OBTENER TODOS LOS USUARIOS
// ==============================================================
app.get("/", mdAutenficación.verificarToken, (req, res, next) => {
    Usuario.find({}, " nombre apellidos email img role ").exec(
        (err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error cargando usuario",
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: "Get Usuarios!!",
                usuarios: usuarios
            });
        }
    );
});

//====================================
// Verificar Token
//====================================

// app.use('/', (req, res, next) => {

//     var token = req.query.token;

//     jwt.verify(token, SEED, (err, decoded) => {
//         if (err) {
//             return res.status(401).json({
//                 ok: false,
//                 mensaje: ' Token no válido',
//                 errors: err
//             });
//         }

//         next();
//     });

// });

// ==============================================================
// CREAR UN NUEVO USUARIOS
// ==============================================================
app.post("/", mdAutenficación.verificarToken, (req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        apellido: body.apellido,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role,
        img: body.img
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear usuario",
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: "Usuario creado correctamente",
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });
});

// ==============================================================
// MODIFICAR UN USUARIO PUT
// ==============================================================

app.put("/:id", mdAutenficación.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                message: " El usuario con el id " + id + " no existe",
                errors: {
                    message: "No existe usuario con ese ID"
                }
            });
        }

        usuario.nombre = body.nombre;
        usuario.apellido = body.apellido;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar usuario",
                    errors: err
                });
            }

            usuarioGuardado.password = " :)"; // NO guarda esto sino lo que hace es mostrarlo en pantalla

            res.status(200).json({
                ok: true,
                message: "El usuario ha sido actualizado",
                usuario: usuarioGuardado
            });
        });
    });
});

//====================================
// DELETE, BORRAR UN REGISTRO
//====================================

app.delete('/:id', mdAutenficación.verificarToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar usuario",
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con ese ID',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: "Usuario borrado correctamente",
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;