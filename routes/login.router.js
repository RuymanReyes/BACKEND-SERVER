var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var SEED = require("../config/config").SEED;

var app = express();
var Usuario = require("../models/usuario.model");

// GOOGLE
var CLIENT_ID = require("../config/config").CLIENT_ID;

const {
    OAuth2Client
} = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);
//====================================
// Autentificación GOOGLE
//====================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        apellido: payload.family_name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {
    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            });
        });

    Usuario.findOne({
        email: googleUser.email
    }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Use una autenficación de Usario y Password",

                });
            } else {
                var token = jwt.sign({
                        usuario: usuarioDB
                    },
                    SEED, {
                        expiresIn: 14400
                    }
                ); // Expira a las 4h.

                res.status(200).json({
                    ok: true,
                    mensaje: "login post correcto!!",
                    usuario: usuarioDB,
                    id: usuarioDB._id,
                    token: token
                });
            }
        } else {
            // el usuario no existe hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.apellido = googleUser.apellido;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {


                if (err) {
                    return res.status(500).json({
                        ok: true,
                        mensaje: 'Error al crear usuario - google',
                        errors: err
                    });
                }


                var token = jwt.sign({
                        usuario: usuarioDB
                    },
                    SEED, {
                        expiresIn: 14400
                    }
                ); // Expira a las 4h.

                res.status(200).json({
                    ok: true,
                    mensaje: "login post correcto  22!!",
                    usuario: usuarioDB,
                    id: usuarioDB._id,
                    token: token
                });
            })


        }
    });

});




//====================================
// Autentificación normal
//====================================

app.post("/", (req, res) => {
    var body = req.body;

    Usuario.findOne({
            email: body.email
        },
        (err, usuarioDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al buscar usuario",
                    errors: err
                });
            }

            if (!usuarioDB) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Credenciales incorrectas - email",
                    errors: err
                });
            }

            if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Credenciales incorrectas - Password",
                    errors: err
                });
            }

            // CREAR UN TOKEN !!!!!

            usuarioDB.password = ";)";

            var token = jwt.sign({
                    usuario: usuarioDB
                },
                SEED, {
                    expiresIn: 14400
                }
            ); // Expira a las 4h.

            res.status(200).json({
                ok: true,
                mensaje: "login post correcto!!",
                usuario: usuarioDB,
                id: usuarioDB._id,
                token: token
            });
        }
    );
});

module.exports = app;