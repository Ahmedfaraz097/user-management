import "reflect-metadata";
import * as dotenv from "dotenv"
import * as express from "express";
import { initDB } from "./Config/data-source";
import { appointmentRouter } from "./routes/appointment.route";
import { authRouter } from "./routes/auth.route";
import { userRouter } from "./routes/user.route";
dotenv.config();

const app = express();
const PORT = process.env.PORT || "5001";

app.use(express.json());
// routes
app.use("/api", authRouter);
app.use("/api", userRouter);
app.use("/api", appointmentRouter);

// running a server after db connect
initDB().then(()=>{
    app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
   })
}).catch((error) => {
    console.error("Failed to initialize database:", error);
});
