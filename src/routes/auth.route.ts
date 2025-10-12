import * as express from "express";
import { AuthController } from "../Controllers/auth.controller";
import { userValidator, loginValidator } from "../middlewares/index";
const Router = express.Router();

Router.post("/login", loginValidator, AuthController.loginUser);
Router.post("/register", userValidator, AuthController.registerUser);

export { Router as authRouter };
