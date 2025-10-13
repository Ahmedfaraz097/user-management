import * as express from "express";
import { AuthController } from "../Controllers/auth.controller";
import { userValidator, loginValidator } from "../middlewares/index";
const Router = express.Router();

Router.post("/login", loginValidator, AuthController.loginUser);
Router.post("/register", userValidator, AuthController.registerUser);
Router.post("/verify-otp", AuthController.verifyOtp);

Router.post("/forgot-password", AuthController.forgotPassword);
Router.post("/reset-password", AuthController.resetPassword);

export { Router as authRouter };
