"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_typescript_1 = require("sequelize-typescript");
var User_1 = require("./models/User"); // Ajusta esta ruta según tu estructura de proyecto
var sequelize = new sequelize_typescript_1.Sequelize({
    dialect: 'mssql',
    host: 'localhost',
    username: 'sa',
    password: 'as',
    database: 'houleCfg',
    models: [User_1.User],
});
exports.default = sequelize;
