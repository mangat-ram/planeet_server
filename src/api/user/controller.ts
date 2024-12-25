import { successResponse, errorResponse } from "../../services/response";
import type { Request, Response } from "express";
import { joiUser } from "../../services/joi";
import User from "./model";

async function create(req: Request, res: Response) {
  try {
    const { error, value } = joiUser.validate(req.body);
    if (error) {
      const errorMessage = error.details.map((error) => error.message).join(", ");
      return res.status(400).json(errorResponse(400, errorMessage));
    }
    return res.status(201).json(successResponse(201, value, "User created successfully"));
  } catch (error : any) {
    return res.status(400).json(errorResponse(400, error.message));
  }
}

export {
  create
}