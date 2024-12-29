import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const requireProcessEnv = (name: string): string => {
  if (!process.env[name]) {
    throw new Error(`Environment variable ${name} is missing`);
  }
  return process.env[name] as string;
};

export const port = requireProcessEnv("PORT");
export const cors = requireProcessEnv("CORS_ORIGIN");
export const apiVersion = requireProcessEnv("API_VERSION");
export const mongoURI = requireProcessEnv("MONGODB_URI");
export const accessTokenSecret = requireProcessEnv("ACCESS_TOKEN_SECRET");
export const accessTokenExpiry = requireProcessEnv("ACCESS_TOKEN_EXPIRY");
export const refreshTokenSecret = requireProcessEnv("REFRESH_TOKEN_SECRET");
export const refreshTokenExpiry = requireProcessEnv("REFRESH_TOKEN_EXPIRY");
export const redisUri = requireProcessEnv("REDIS_URI");
export const emailUser = requireProcessEnv("EMAIL_USER");
export const emailPassword = requireProcessEnv("EMAIL_PASS");
export const saltRounds = parseInt(requireProcessEnv("SALT_ROUNDS"), 10);