import "reflect-metadata";
import * as dotenv from "dotenv"
import * as express from "express";
import { initDB } from "./Config/data-source";
dotenv.config();

const app = express();
const PORT = process.env.PORT || "5001";

app.use(express.json());

initDB().then(()=>{
    app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
   })
}).catch((error) => {
    console.error("Failed to initialize database:", error);
});
