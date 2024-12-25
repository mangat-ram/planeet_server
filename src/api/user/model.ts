import crypto from "crypto";
import mongoose,{
    Schema,
    Document,
    Model,
    Types
} from "mongoose";
import { sign } from "jsonwebtoken";

//Define User Roles
export const roles = ['user', 'admin', 'superAdmin'] as const;
export const userRoles = ['user', 'admin'] as const;

//Define user role types
type role = typeof roles[number];
type userRoles = typeof userRoles[number];

//Define User Interface
export interface IUser extends Document {
    _id: Types.ObjectId;
    username: string;
    phoneNumber: string;
    email: string;
    password: string;
    avatar?: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    role: role;
    tasks?: Types.ObjectId[] | string[];
    completedTasksCount?: number;
    notificationsEnabled: boolean;
}


