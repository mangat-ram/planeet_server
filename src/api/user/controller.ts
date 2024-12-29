import { successResponse, errorResponse } from "../../services/response";
import type { RequestHandler } from "express";
import { joiUser } from "../../services/joi";
import { sendMail } from "../../services/nodemailer";
import User from "./model";
import { Types } from "mongoose";
import { customAlphabet } from "nanoid";
import { getRedisClient } from "../../services/redis";
import { CustomRequest } from "../../services/jwt";

const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
const generateNanoId = customAlphabet(chars, 12);

// Helper function to create a unique random ID for Redis
const createRandomId = async () => {
  const redis = getRedisClient();
  let exists = true;
  let result;
  
  while (exists) {
    result = generateNanoId();
    const id = await redis.get(`emailId::${result}`);
    exists = !!id;  // Keep checking until the ID is unique
  }

  return result;  // Return the unique random ID once found
}

// Helper function to generate access and refresh tokens
const generateAccessAndRefreshToken = async (userId: Types.ObjectId) => {
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

// Create user route
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
      res.status(500).json(errorResponse(500, "Failed to create user"));
    }

    const result = await User.findById(user._id).select("-password -refreshToken -__v -verifyCode");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    if (result) {
      result.accessToken = accessToken;
      result.refreshToken = refreshToken;
    }

    // Create a unique emailId for Redis and set expiration to 1 day (86400 seconds)
    const emailId = await createRandomId();
    const redis = getRedisClient();
    await redis.setex(`emailId::${emailId}`, 86400, user.email); // Set expiry to 1 day (86400 seconds)

    // Send OTP verification email
    await sendMail(
      { 
        recipientEmail: value.email, 
        subject: "OTP Verification", 
        otp: verifyCode 
      }
    );

    res.status(201).json(successResponse(201, result, "User created successfully. Please verify your email"));
  } catch (error: any) {
    res.status(400).json(errorResponse(400, error.message));
  }
}

// Show user details route
const showMe: RequestHandler = async (req: CustomRequest, res): Promise<void> => {
  const redis = getRedisClient();
  try {
    const { user } = req.user;
    if (!user) {
      res.status(401).json(errorResponse(401, "Unauthorized"));
    }

    const emailId = await createRandomId();  // Create unique random ID for email
    await redis.setex(`emailId::${emailId}`, 3600, user.email); // Cache with 1 hour expiration

    res.status(200).json(successResponse(200, user, "User data retrieved successfully"));
  } catch (error: any) {
    res.status(500).json(errorResponse(500, error.message));
  }
}

const currentUser:RequestHandler = async(req:CustomRequest, res) => {
  res
  .status(200)
  .json(successResponse(200,req.user,"Current User Fetched Successfully."))
}

const login: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;
    if(!email || !password) {
      res.status(400).json(errorResponse(400, "Email and password are required"));
    }
    const user = await User.findOne({
      email
    });
    if (!user) {
      res.status(404).json(errorResponse(404, "User not found"));
      return;
    }
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(401).json(errorResponse(401, "Invalid password"));
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const loggedUser = await User.findById(user._id).select("-password -refreshToken -__v -verifyCode");

    const options = {
      httpOnly: true,
      secure:true
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(successResponse(200, {user:loggedUser,accessToken,refreshToken}, "Login successful"));
  }catch(error: any) {
    res.status(500).json(errorResponse(500, error.message));
  }
}

const logout:RequestHandler = async(req:CustomRequest,res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          refreshToken:undefined
        }
      },
      {
        new:true
      }
    )
  
    const options = {
      httpOnly:true,
      secure:true
    }
  
    res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(successResponse(200,{},"User Logged Out."))
  } catch (error: any) {
    res.status(500).json(errorResponse(500, `Error in catch part ::: ${error.message}`));
  }
}

export {
  create,
  showMe,
  login,
  currentUser,
  logout
}
