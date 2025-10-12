import { AppDataSource } from "../Config/data-source";
import { Appointment } from "../entity/appointment";
import { User } from "../entity/User";
import { AppointmentService } from "../services/appointment.service";
import { UserService } from "../services/user.service";

export const userRepository  = new UserService(
    AppDataSource.getRepository(User)
)
export const appointmentRepository = new AppointmentService(
  AppDataSource.getRepository(Appointment)
);
