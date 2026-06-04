"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const usuario_entity_1 = __importDefault(require("./usuario/models/usuario.entity"));
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "root",
    database: "donaciones_db",
    entities: [usuario_entity_1.default],
    synchronize: true,
    logging: true,
});
exports.AppDataSource.initialize()
    .then(() => {
    console.log('Data source initialized successfully');
})
    .catch((error) => {
    console.log(error);
});
//# sourceMappingURL=index.js.map