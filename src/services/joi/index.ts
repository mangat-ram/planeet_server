import Joi from "joi";

// Define the schema for the user object
export const joiUser = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  name: Joi.string().min(3).max(50).required(),
  phoneNumber: Joi.string().min(10).max(15).required(),
  email: Joi.string().min(5).max(255).required().email(),
  password: Joi.string().min(6).max(1024).required(),
  isVerified: Joi.boolean().default(false),
  avatar: Joi.string().default(null),
  role: Joi.string().valid("user", "admin").default("user"),
  projects: Joi.array().items(Joi.string().required()),
  tasks: Joi.array().items(Joi.string().required()),
});