import "reflect-metadata";
import { DataSource } from "typeorm";

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST || "localhost",
  port: Number(DB_PORT) || 5432,
  username: DB_USER || "postgres",
  password: DB_PASSWORD || "ahmed12345",
  database: DB_NAME || "user_creation_assignment",

  synchronize: true,
  logging: false,
  entities: ["src/entity//*.ts"],
  migrations: ["src/migration//*.ts"],
})

export const initDB = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database Connected Successfully")
    } catch (error) {
        console.error("Error initializing database:", error);
        process.exit(1);
    }
}