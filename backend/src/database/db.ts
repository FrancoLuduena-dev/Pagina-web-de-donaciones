import postgres, { Sql } from 'postgres';

const sql: Sql = postgres('postgresql://username:password@localhost:5432/database_name'); // Reemplaza con tus credenciales

export default sql;