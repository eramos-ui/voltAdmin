"use strict";
// import sequelize from "../lib/sequelize";
// import { User } from "../lib/models/User";
Object.defineProperty(exports, "__esModule", { value: true });
// async function main() {
//   try {
//     const newUser = await User.create({ name: 'Jane Doe', email: 'jane@example.com' });
//     console.log("Nuevo usuario creado:", newUser.toJSON());
//     const users = await User.findAll();
//     console.log("Usuarios en la base de datos:", users.map(user => user.toJSON()));
//   } catch (error) {
//     console.error("Error al interactuar con la base de datos:", error);
//   } finally {
//     await sequelize.close();
//   }
// }
// main();
require("reflect-metadata");
var sequelize_typescript_1 = require("sequelize-typescript");
var User_1 = require("../lib/models/User"); // Ajusta la ruta según tu estructura
var sequelize = new sequelize_typescript_1.Sequelize({
    dialect: 'mssql',
    host: 'localhost',
    username: 'sa',
    password: 'zzz', // Reemplaza con tu contraseña
    database: 'houleCfg',
    models: [User_1.User],
});
sequelize.authenticate()
    .then(function () {
    console.log('Conexión exitosa a la base de datos');
})
    .catch(function (err) {
    console.error('Error al conectar a la base de datos:', err);
});
