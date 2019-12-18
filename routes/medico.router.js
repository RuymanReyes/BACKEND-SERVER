var express = require("express");
var app = express();

var mdAutenficación = require("../midelware/autenficacion");

var Medico = require("../models/medico.model");

// ==============================================================
// OBTENER TODOS LOS MEDICO
// ==============================================================
app.get("/", (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);


    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', ' nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error cargando médicos",
                        errors: err
                    });
                }

                Medico.countDocuments({}, (err, conteo) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: "Error cargando Médicos",
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        mensaje: "Get Médicos!!",
                        medicos: medicos,
                        total: conteo
                    });
                });
            }
        );
});



// ==============================================================
// CREAR UN NUEVO MEDICO 
// ==============================================================
app.post("/", mdAutenficación.verificarToken, (req, res) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital


    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear Hospital",
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: "Médico creado correctamente",
            medico: medicoGuardado,
        });
    });
});

// ==============================================================
// MODIFICAR UN MEDICO PUT
// ==============================================================

app.put("/:id", mdAutenficación.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar Médico",
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                message: " El Médico con el id " + id + " no existe",
                errors: {
                    message: "No existe Médico con ese ID"
                }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar médico",
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                message: "El médico ha sido actualizado",
                medico: medicoGuardado
            });
        });
    });
});

//====================================
// DELETE, BORRAR UN HOSPITAL
//====================================

app.delete("/:id", mdAutenficación.verificarToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar Médico",
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe médico con ese ID",
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: "Médico borrado correctamente",
            medico: medicoBorrado
        });
    });
});

module.exports = app;