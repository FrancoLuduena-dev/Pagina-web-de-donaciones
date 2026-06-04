import "reflect-metadata";
import { DataSource } from "typeorm";
import Usuario from "./usuario/models/usuario.entity";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "root",
    database: "donaciones_db",
    entities: [Usuario],
    synchronize: true,
    logging: true,
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data source initialized successfully');
  })
  .catch((error) => {
    console.log(error);
  });

