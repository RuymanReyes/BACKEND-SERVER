// REQUIRES
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

// Inizializar variables
var app = express();



// BODY PARSER 
// parse application/x-www-form-urlencoded
// parse application/json

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// rutas Importar
var appRoutes = require("./routes/index.router");
var usuarioRoutes = require("./routes/usuario");
var loginRoutes = require("./routes/login");

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
app.use("/", appRoutes);

// escuchar peticiones
app.listen(3000, () => {
    console.log(
        "Express server corriendo puerto 3000:\x1b[32m%s\x1b[0m",
        "online"
    );
});