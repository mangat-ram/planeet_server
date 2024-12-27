import type { RequestHandler, Request } from "express";
import jwt from "jsonwebtoken";
import { errorResponse } from "../response";

interface CustomRequest extends Request {
  user?: any;
}

export const verifyToken: RequestHandler = (req: CustomRequest, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    res.status(401).json(errorResponse(401, 'unauthorized'));
    return;
  }

  jwt.verify(token, 'your_secret_key', (err, user) => {
    if (err) {
      res.status(403).json(errorResponse(403, 'invalid token'));
      return;
    }
    req.user = user;
    next();
  });
};