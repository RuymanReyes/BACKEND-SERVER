var express = require("express");
var app = express();

var mdAutenficación = require("../midelware/autenficacion");

var Hospital = require("../models/hospital.model");

// ==============================================================
// OBTENER TODOS LOS HOSPITALES
// ==============================================================
app.get("/", (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);


    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error cargando hospitales",
                        errors: err
                    });
                }
                Hospital.countDocuments({}, (err, conteo) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: "Error cargando Hospital",
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        mensaje: "Get Hospitales!!",
                        hospitales: hospitales,
                        total: conteo
                    });
                });

            }
        );
});



// ==============================================================
// CREAR UN NUEVO HOSPITAL 
// ==============================================================
app.post("/", mdAutenficación.verificarToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id

    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear Hospital",
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: "Hospital creado correctamente",
            hospital: hospitalGuardado,
        });
    });
});

// ==============================================================
// MODIFICAR UN HOSPITAL PUT
// ==============================================================

app.put("/:id", mdAutenficación.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar Hospital",
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                message: " El hospital con el id " + id + " no existe",
                errors: {
                    message: "No existe hospital con ese ID"
                }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar hospital",
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                message: "El hospital ha sido actualizado",
                hospital: hospitalGuardado
            });
        });
    });
});

//====================================
// DELETE, BORRAR UN HOSPITAL
//====================================

app.delete("/:id", mdAutenficación.verificarToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar Hospital",
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe hospital con ese ID",
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: "Hospital borrado correctamente",
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;