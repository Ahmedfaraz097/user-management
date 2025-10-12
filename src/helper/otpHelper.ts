import { AppDataSource } from "../Config/data-source";
import { User } from "../entity/User";
import { userRepository } from "../repository/index";
export class OtpHelper {
  static generateOtp(): number {
    return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
  }

  static async setOtpForUser(params: {
    id: number;
    otpCode: number;
    otpGeneratedAt: Date;
    otpExpiredAt: Date;
  }) {
    const { id, otpCode, otpGeneratedAt, otpExpiredAt } = params;

    // Find the user by ID
    const userrepo = AppDataSource.getRepository(User);
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    // Update OTP details
    const set = userrepo.create({
        ...user,
        otpCode,
        otpGeneratedAt,
        otpExpiredAt,
        });
    await userrepo.save(set);
    return set;
  }

  static isOtpValid(user: User, otp: number): boolean {
    const now = new Date();
    return user.otpCode === otp && user.otpExpiredAt > now;
  }
}
