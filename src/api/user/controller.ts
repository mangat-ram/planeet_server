import { successResponse, errorResponse } from "../../services/response";
import type { RequestHandler } from "express";
import { joiUser } from "../../services/joi";
import { sendMail } from "../../services/nodemailer";
import User from "./model";
import { Types } from "mongoose";

const generateAccessAndRefreshToken = async (userId: Types.ObjectId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
  } catch (err : any) {
    return errorResponse(500, err.message);
  }
}


const create: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { error, value } = joiUser.validate(req.body);
    if (error) {
      const errorMessage = error.details.map((error) => error.message).join(", ");
      res.status(400).json(errorResponse(400, errorMessage));
    }
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const isAdmin = req.query.admin;
    if (isAdmin && isAdmin === 'true') {
      value.role = "admin";
    }
    const user = new User({ ...value, verifyCode });
    await user.save();

    if (!user) {
      res.status(500).json(errorResponse(500, "User could not be created"));
      return;
    }

    const result = await User.findById(user._id).select("-password -refreshToken -__v -verifyCode");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    if (result) {
      result.accessToken = accessToken;
      result.refreshToken = refreshToken;
    }

    await sendMail(
      { 
        recipientEmail: value.email, 
        subject: "OTP Verification", 
        otp: verifyCode 
      }
    );

    res.status(201).json(successResponse(201,result, "user created successfully. Please verify your email"));
  } catch (error : any) {
    res.status(400).json(errorResponse(400, error.message));
  }
}

export {
  create
}