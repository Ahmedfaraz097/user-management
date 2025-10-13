import * as nodemailer from "nodemailer";

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export class Mailer {
  static async sendEmail({ to, subject, html }: MailOptions): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: `"UserManagement Project" <${process.env.SENDER_EMAIL}>`,
        to,
        subject,
        html,
        replyTo: process.env.REPLY_TO,
      });

      console.log(`📧 Email successfully sent to ${to}`);
    } catch (error) {
      console.error("❌ Error sending email:", error);
      throw new Error("Failed to send email");
    }
  }
}
