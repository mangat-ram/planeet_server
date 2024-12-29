import type { RequestHandler, Request } from "express";
import jwt from "jsonwebtoken";
import { errorResponse } from "../response";
import { accessTokenSecret } from "../../config";
import User from "../../api/user/model";

export interface CustomRequest extends Request {
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

export const verifyJWT:RequestHandler = async (req:CustomRequest,res,next) => {
  try{
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");

    if(!token){
      res.status(401).json(errorResponse(401,"Unauthorized!"))
    }

    const decodedToken = jwt.verify(token, accessTokenSecret) as any;
    const user = await User.findById(decodedToken?._id).select("-passWord -refreshToken")

    if(!user){
      res.status(401).json(errorResponse(401,"Unauthorized!"))
    }

    req.user = user;
    next()
  }catch(error){
    res.status(401).json(errorResponse(401,"Unauthorized!"))
  }
}