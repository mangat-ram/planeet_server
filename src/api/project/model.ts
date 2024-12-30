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
  projectCreator: Types.ObjectId;
  projectMembers: Types.ObjectId[];
}

// Project Document Type
export type ProjectDocument = IProject & Document;

// Project Model
export const ProjectModel = model<ProjectDocument>("Project", new Schema({
  projectName: { type: String, required: true },
  projectDescription: { type: String, required: true },
  projectComponents: { type: [String], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { type: String, default: 'assigned' },
  projectCreator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  projectMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true }));
