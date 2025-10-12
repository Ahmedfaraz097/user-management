import * as express from "express";
import { authentification } from "../middlewares/authenticationValidater";
import { authorization } from "../middlewares/authorization";
import { userRoles } from "../enum/userRole";
import { AppointmentController } from "../Controllers/appointment.controller";
import { appointmentValidator } from "../middlewares/appointmentValidater";

const Router = express.Router();

Router.post(
  "/appointment",
  authentification,
  authorization([userRoles.DOCTOR, userRoles.PATIENT]),
  appointmentValidator,
  AppointmentController.createAppointment
);

export { Router as appointmentRouter };
