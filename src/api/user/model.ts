import crypto from "crypto";
import bcrypt from "bcrypt";
import mongoose,{
    Schema,
    Document,
    Model,
    Types
} from "mongoose";
import { sign } from "jsonwebtoken";
import searchable from 'mongoose-searchable';

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
    name: string;
    phoneNumber: string;
    email: string;
    password: string;
    isVerified: boolean;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
    role: role;
    projects: Types.ObjectId[];
    tasks: Types.ObjectId[];
    completedTasksCount: number;
    notificationsEnabled: boolean;
}

// User methods interface
export interface IUserMethods {
    generateAccessToken(): string;
    generateRefreshToken(): string;
    comparePassword(candidatePassword: string): Promise<boolean>;
    updateTasks(taskId: Types.ObjectId): Promise<IUser>;
    updateCompletedTasksCount(): Promise<IUser>;
    updateProjects(projectId: Types.ObjectId): Promise<IUser>;
}

//Define User Document Type
export type UserDoc = Document<IUser> & IUser & { _id: Types.ObjectId } &  IUserMethods;

//Define User Model Type
export type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

//Define User Schema
const userSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 50
        },
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 50
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 10,
            maxlength: 15
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 5,
            maxlength: 255
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            maxlength: 1024
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        avatar: {
            type: String,
            default: null
        },
        role: {
            type: String,
            enum: roles,
            default: 'user'
        },
        projects: [{
            type: Schema.Types.ObjectId,
            ref: 'Project'
        }],
        tasks: [{
            type: Schema.Types.ObjectId,
            ref: 'Task'
        }],
        completedTasksCount: {
            type: Number,
            default: 0
        },
        notificationsEnabled: {
            type: Boolean,
            default: true
        }
    }, 
  { timestamps: true }
);

//Create Indexes at createdAt and updatedAt Fields
userSchema.index({ createdAt: 1, updatedAt: 1, username: 1, email: 1, phoneNumber: 1 });

// Method to check whether password is modified or not, if not hash the password
userSchema.pre<UserDoc>('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await crypto.randomBytes(8).toString('hex');
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

//Method to check password is correct or not
userSchema.methods.comparePassword = async function(candidatePassword: string) {
    return await bcrypt.compare(candidatePassword, this.password);
};

//Method to generate access token
userSchema.methods.generateAccessToken = function() {
    return sign(
        {
        _id: this._id,
        email: this.email,
        userName: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
}

//Method to generate refresh token
userSchema.methods.generateRefreshToken = function() {
    return sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
}

//Update user when project is created
userSchema.methods.updateProjects = function(projectId: Types.ObjectId) {
    this.projects.push(projectId);
    return this.save();
}

//Update user when task is created
userSchema.methods.updateTasks = function(taskId: Types.ObjectId) {
    this.tasks.push(taskId);
    return this.save();
}

//Update user when task is completed
userSchema.methods.updateCompletedTasksCount = function() {
    this.completedTasksCount++;
    return this.save();
}

//Add searchable plugin
userSchema.plugin(searchable, {
    fields: ['username', 'email', 'phoneNumber']
});

//Create User Model
const model = mongoose.model<IUser, UserModel>('User', userSchema);

/**
 * Checks if a given document is an instance of the User model
 * @param doc - The document to check
 * @returns True if the document is an instance of the User model, false otherwise
 */
export function isUser(doc: Document): doc is UserDoc {
    return doc instanceof model;
}

//Export user schema and model
export const schema = userSchema;
export default model;