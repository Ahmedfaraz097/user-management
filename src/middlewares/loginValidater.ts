import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { LoginDto } from "../dto/loginDto";

export const loginValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const loginDto = plainToClass(LoginDto, req.body);
  const errors: ValidationError[] = await validate(loginDto)

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => Object.values(error.constraints || {}))
      .flat();
    return res.status(400).json({ errors: errorMessages });
  } else {
    next();
  }
};
