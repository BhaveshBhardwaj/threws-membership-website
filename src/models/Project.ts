import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  leadResearcher: mongoose.Types.ObjectId;
  collaborators: mongoose.Types.ObjectId[];
  seekingCollaborators: boolean;
  requiredSkills: string[];
  fundingStatus: "funded" | "seeking_funding" | "not_applicable";
  status: "active" | "completed" | "on_hold";
  startDate: Date;
  endDate?: Date;
  updates: Array<{
    date: Date;
    content: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
    },
    leadResearcher: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    collaborators: [
      {
        type: Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    seekingCollaborators: {
      type: Boolean,
      default: false,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    fundingStatus: {
      type: String,
      enum: ["funded", "seeking_funding", "not_applicable"],
      default: "not_applicable",
    },
    status: {
      type: String,
      enum: ["active", "completed", "on_hold"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    updates: [
      {
        date: { type: Date, default: Date.now },
        content: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

ProjectSchema.index({ status: 1 });
ProjectSchema.index({ seekingCollaborators: 1 });
ProjectSchema.index({ title: "text", description: "text" });

const Project: Model<IProject> =
  mongoose.models.Project ||
  mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
