import { Request, Response } from "express";
import { userRepository } from "../repository";
import Encrypt from "../helper/encryptHelper";
import { OtpHelper } from "../helper/otpHelper";
import { UserResponseDto } from "../dto/responce/userResponceDto";
import { Mailer } from "../helper/mailHelper";
import { AppDataSource } from "../Config/data-source";
import { User } from "../entity/User";

interface OtpParams {
  otpCode: number;
  otpGeneratedAt: Date;
  otpExpiredAt: Date;
}

export class AuthController {
  static async registerUser(req: Request, res: Response) {
    const user = await userRepository.createUser(req.body);
    const { email } = req.body;
    if (user) {
      if (user.isVerified) {
        return res
          .status(400)
          .json({ message: "User already exists and is verified" });
      } else {
        const generateOtp = OtpHelper.generateOtp();
        const updatedUser = OtpHelper.setOtpForUser({
          id: user.id,
          otpCode: Number(generateOtp),
          otpGeneratedAt: new Date(),
          otpExpiredAt: new Date(new Date().getTime() + 10 * 60000),
        });
        // OTP valid for 10 minutes
        try {
          await Mailer.sendEmail({
            // send OTP via email
            to: email,
            subject: "Your Verification OTP",
            html: `<p>Use this OTP to verify your account:</p><h2>${generateOtp}</h2><p>It expires in 10 minutes.</p>`,
          });
        } catch (err) {
          console.log("[v0] Failed to send OTP:", (err as Error).message);
        }
        return res
          .status(200)
          .json({ message: "Unverified account found. OTP resent to email." });
      }
    }

    res.status(201).json(user);
  }

  static async verifyOtp(req: Request, res: Response) {
    const { email, otp } = req.body || {};
    if (!otp) {
      return res.status(400).json({ message: "otp are required" });
    }

    const user = await userRepository.findByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isVerified = true;
    user.otpCode = null;
    user.otpGeneratedAt = null;
    user.otpExpiredAt = null;
    await userRepository.updateUser(user.id, user);
    res.status(200).json({ message: "Account verified successfully" });
    try{ 
        await Mailer.sendEmail({
        to: email,
        subject: "Account Verified",
        html: `<p>Your account has been successfully verified. You can now log in.</p>`,
    });
    } catch (err) {
        console.log("[v0] Failed to send confirmation email:", (err as Error).message); 
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: "email is required" });

    const user = await userRepository.findByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = OtpHelper.generateOtp();
    await OtpHelper.setOtpForUser({
      id: user.id,
      otpCode: otp,
      otpGeneratedAt: new Date(),
      otpExpiredAt: new Date(new Date().getTime() + 10 * 60000),
    });
    try {
      await Mailer.sendEmail({
        to: email,
        subject: "Your Password Reset OTP",
        html: `<p>Use this OTP to reset your password:</p><h2>${otp}</h2><p>It expires in 10 minutes.</p>`,
      });
    } catch (err) {
      console.log("Failed to send reset OTP:", (err as Error).message);
    }
    return res.status(200).json({ message: "Reset OTP sent to email" });
  }

  static async resetPassword(req: Request, res: Response) {
    const { email, otp, newPassword } = req.body || {};
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const UserRepository = AppDataSource.getRepository(User);
    const user = await UserRepository.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!OtpHelper.ValidOtp(user,Number(otp))){
       return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await Encrypt.hashPassword(newPassword);
    user.otpCode = null;
    user.otpGeneratedAt = null;
    user.otpExpiredAt = null;
    await UserRepository.save(user);

    return res.status(200).json({ message: "Password reset successful" });
  }

  static async loginUser(req: Request, res: Response) {
    const { email, password } = req.body;
    const user = await userRepository.findByEmail(email);

    if(user.isVerified == true){
        if (!user || !(await Encrypt.comparePassword(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = await Encrypt.generateToken({ id: user.id });
    const refreshToken = await Encrypt.generateRefreshToken({ id: user.id });
    res
      .status(200)
      .json({ user: new UserResponseDto(user), token, refreshToken });
    }else{
        res
      .status(401)
      .json({ message: "please first verify your account" });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    try {
      const payload = await Encrypt.verifyToken(refreshToken);
      const newToken = await Encrypt.generateToken({ id: payload.id });
      const newRefreshToken = await Encrypt.generateRefreshToken({
        id: payload.id,
      });
      res.status(200).json({ token: newToken, refreshToken: newRefreshToken });
    } catch (error) {
      res.status(401).json({ message: "Invalid refresh token" });
    }
  }
}
