import "reflect-metadata";
import * as dotenv from "dotenv"
import * as express from "express";
import { initDB } from "./Config/data-source";
import { appointmentRouter } from "./routes/appointment.route";
import { authRouter } from "./routes/auth.route";
import { userRouter } from "./routes/user.route";
import * as cors from 'cors'
import * as cookieParser from "cookie-parser"
dotenv.config();

const app = express();
const PORT = process.env.PORT || "5001";

app.use(
  cors({
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
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
