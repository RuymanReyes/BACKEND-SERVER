var express = require("express");
var app = express();

var Hospital = require('../models/hospital.model');
var Medico = require('../models/medico.model');
var Usuario = require('../models/usuario.model');

//====================================
//BUSQUEDA POR COLECCION 
//====================================

app.get("/coleccion/:tabla/:busqueda", (req, res) => {


    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    var tabla = req.params.tabla;

    var promesa;

    switch (tabla) {

        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipo de busqueda sólo son: usuarios, medicos y hospitales',
                error: {
                    message: ' tipo de tabla o colección incorrectos'
                }
            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});









//====================================
// BUSQUEDA GENERAL 
//====================================
app.get("/todo/:busqueda", (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');


    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                mensaje: "Petición realizada correctamente",
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });

});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({
                nombre: regex
            })
            .populate('usuario', 'nombre email img')
            .exec((err, hospitales) => {

                if (err) {

                    reject('Error al cargar Hospitales', err);

                } else {
                    resolve(hospitales);
                }
            });

    });
}


function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Medico.find({
                nombre: regex
            })
            .populate('usuario', ' nombre email img')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {

                    reject('Error al cargar Médicos', err);

                } else {
                    resolve(medicos);
                }
            });

    });
}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, ' nombre apellido email role img')
            .or([{
                    nombre: regex
                },
                {
                    email: regex
                }
            ])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}



module.exports = app;