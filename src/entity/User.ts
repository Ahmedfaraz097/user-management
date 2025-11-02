import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { userRoles } from "../enum/userRole";
import { Doctor } from "../entity/doctor";
import { Patient } from "../entity/patient";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ type: "enum", enum: userRoles, default: userRoles.PATIENT })
  role: userRoles;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  otpCode: number;

  @CreateDateColumn({ nullable: true })
  otpGeneratedAt: Date;

  @CreateDateColumn({nullable: true})
  otpExpiredAt: Date;


  @OneToOne(() => Patient, (Patient) => Patient.user)
  patient: Patient;

  @OneToOne(() => Doctor, (Doctor) => Doctor.user)
  doctor: Doctor;
}
