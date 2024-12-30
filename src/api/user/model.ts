import bcrypt from "bcrypt";
import mongoose,{
    Schema,
    Document,
    Model,
    Types
} from "mongoose";
import { sign } from "jsonwebtoken";
import searchable from "mongoose-searchable";
import { 
    accessTokenExpiry, 
    accessTokenSecret, 
    refreshTokenExpiry, 
    refreshTokenSecret,
    getBcryptRoundsFromEnv
} from "../../config";


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
    passwordSetDate: Date;
    verifyCode: string;
    nanoId: string;
    isVerified: boolean;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
    role: role;
    projects: Types.ObjectId[];
    tasks: Types.ObjectId[];
    completedTasksCount: number;
    notificationsEnabled: boolean;
    accessToken?: string;
    refreshToken?: string;
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
        passwordSetDate: {
            type: Date,
            default: null
        },
        verifyCode: {
            type: String,
            required: true
        },
        nanoId: {
            type: String,
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
        },
        accessToken: {
            type: String,
        }, 
        refreshToken: {
            type: String,
        }
    },
    { timestamps: true }
);

//Create Indexes at createdAt and updatedAt Fields
userSchema.index({ createdAt: 1, updatedAt: 1, username: 1, email: 1, phoneNumber: 1 });

// Method to check whether password is modified or not, if not hash the password
userSchema.pre<UserDoc>('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        if (this.password) {
            const saltRounds = getBcryptRoundsFromEnv();
            const hash = await bcrypt.hash(this.password, saltRounds);
            this.password = hash;
            this.passwordSetDate = new Date();
        }
    } catch (error: any) {
        return next(new Error(error.message));
    }
});

//Method to check password is correct or not
userSchema.methods.comparePassword = async function(candidatePassword: string) {
    const valid = await bcrypt.compare(candidatePassword, this.password);
    if(valid) {
        const currentRounds = await bcrypt.getRounds(this.password);
        const rounds = getBcryptRoundsFromEnv();
        if(currentRounds !== rounds) {
            const hash = await bcrypt.hash(candidatePassword, rounds);
            this.password = hash;
            await this.save();
        }
        return true;
    }
    return false;
};

//Method to generate access token
userSchema.methods.generateAccessToken = function() {
    return sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.username,
        },
        accessTokenSecret as string,
        {
            expiresIn: accessTokenExpiry
        }
    );
}

//Method to generate refresh token
userSchema.methods.generateRefreshToken = function() {
    return sign(
        {
            _id: this._id,
        },
        refreshTokenSecret as string,
        {
            expiresIn: refreshTokenExpiry
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