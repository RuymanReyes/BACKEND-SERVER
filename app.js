// REQUIRES
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

// Inizializar variables
var app = express();

//====================================
// middelware de cors 
//====================================
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, PUT, OPTIONS");
    next();
});


// BODY PARSER 
// parse application/x-www-form-urlencoded
// parse application/json

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// rutas Importar
var appRoutes = require("./routes/index.router");
var usuarioRoutes = require("./routes/usuario.router");
var loginRoutes = require("./routes/login.router");
var hospitalRoutes = require("./routes/hospital.router");
var medicoRoutes = require("./routes/medico.router");
var busquedaRoutes = require("./routes/busqueda.router");
var uploadRoutes = require("./routes/upload.router");
var imagenesRoutes = require("./routes/imagenes.router");

// Conexión a la base de datos
mongoose.connect(
    "mongodb://localhost:27017/hospitaldb", {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    },
    (err, res) => {
        if (err) throw err;

        console.log("Base de datos:\x1b[32m%s\x1b[0m", "online");
    }
);

// Midleware RUTAS
app.use("/usuario", usuarioRoutes);
app.use("/login", loginRoutes);
app.use("/hospital", hospitalRoutes);
app.use("/medico", medicoRoutes);
app.use("/busqueda", busquedaRoutes);
app.use("/upload", uploadRoutes);
app.use("/imagenes", imagenesRoutes);
app.use("/", appRoutes);

// escuchar peticiones
app.listen(3000, () => {
    console.log(
        "Express server corriendo puerto 3000:\x1b[32m%s\x1b[0m",
        "online"
    );
});