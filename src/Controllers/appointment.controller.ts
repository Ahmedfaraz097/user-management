import { Request, Response } from "express";
import { Mailer, MailOptions } from "../helper/mailHelper";
import { appointmentRepository } from "../repository";
import { AppDataSource } from "../Config/data-source";
export class AppointmentController {
  static async getAllAppointments(req: Request, res: Response) {
    const appointments = await appointmentRepository.findAll();
    res.json(appointments);
  }

  static async createAppointment(req: Request, res: Response, next: Function) {
    try {
      const appointment = await appointmentRepository.createAppointment(
        req.body
      );
      const patientrepository = AppDataSource.getRepository("Patient");
      const patient = await patientrepository.findOne({
        where: { id: req.body.patientId },
        relations: ["user"],
      });
      const to = patient?.user?.email;
      const date = new Date().toLocaleString();
      const name = patient?.user?.firstName;

      await Mailer.sendEmail({
        to,
        subject: "Appointment Confirmation",
        html: `<p>Dear ${name},</p><p>Your appointment is booked for ${date}.</p>`,
      } as MailOptions);

      return res.status(201).json({
        message: "Appointment created and email sent successfully!",
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAppointment(req: Request, res: Response) {
    const appointmentId = Number(req.params.id);
    const appointment = await appointmentRepository.updateAppointment(
      appointmentId,
      req.body
    );
    res.status(200).json(appointment);
  }

  static async deleteAppointment(req: Request, res: Response) {
    const appointmentId = Number(req.params.id);
    const isDeleted = await appointmentRepository.delete(appointmentId);
    if (!isDeleted) {
      res.status(404).json({ message: "Appointment not found" });
    } else {
      res.status(200).json(null);
    }
  }
}