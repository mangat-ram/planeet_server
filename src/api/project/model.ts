import { Schema, model, Document, Types } from "mongoose";

// Project Interface
export interface IProject extends Document {
  _id: Types.ObjectId;
  projectName: string;
  projectDescription: string;
  projectComponents: string[];
  startDate: Date;
  endDate?: Date;
  status: 'assigned' | 'inProgress' | 'paused' | 'completed';
  projectCreator: string;
  projectMembers: Types.ObjectId[];
}

// Project Document Type

