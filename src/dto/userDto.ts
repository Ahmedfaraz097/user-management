import { IsString, IsEmail, IsOptional } from "class-validator";

export class UserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  role?: string;
}
