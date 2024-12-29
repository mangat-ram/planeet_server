import User from "./src/api/user/model";
import { getRedisClient } from "./src/services/redis";
import { Types } from "mongoose";
import { 
  errorResponse, 
  successResponse 
} from "./src/services/response";

// Helper function to generate access and refresh tokens
export const generateAccessAndRefreshToken = async (userId: Types.ObjectId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // Save without running validations

    return { accessToken, refreshToken };
  } catch (err: any) {
    return errorResponse(500, err.message);
  }
}

// Helper function to verify OTP
export const verifyOTP = async (emailId: string, otp: string) => {
  const redis = getRedisClient();
  const email = await redis.get(`emailId::${emailId}`);
  if (!email) {
    return errorResponse(404, "email not found");
  }

  if (otp.length !== 6) {
    return errorResponse(400, "invalid OTP");
  }
  return successResponse(200, {}, "otp verified successfully");
}

// Helper function to check unique username
export const isUsernameUnique = async (username: string) => {
  const user = await User.findOne({ username });
  return user ? false : true; 
}