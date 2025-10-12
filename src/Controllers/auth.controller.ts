import { Request, Response } from "express";
import { userRepository } from "../repository";
import Encrypt from "../helper/encryptHelper";
import { OtpHelper } from "../helper/otpHelper";
import { UserResponseDto } from "../dto/responce/userDto";
import { Mailer } from "../helper/mailHelper";

interface OtpParams {
  otpCode: number;
  otpGeneratedAt: Date;
  otpExpiredAt: Date;
}

export class AuthController {
  static async registerUser(req: Request, res: Response) {
    const user = await userRepository.createUser(req.body);
    const { email, password } = req.body;
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

  static async loginUser(req: Request, res: Response) {
    const { email, password } = req.body;
    const user = await userRepository.findByEmail(email);

    if (!user || !(await Encrypt.comparePassword(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = await Encrypt.generateToken({ id: user.id });
    const refreshToken = await Encrypt.generateRefreshToken({ id: user.id });
    res
      .status(200)
      .json({ user: new UserResponseDto(user), token, refreshToken });
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
