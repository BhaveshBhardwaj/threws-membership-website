import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId;
  type: "student" | "collaborator" | "professional" | "senior" | "fellow" | "distinguished_fellow";
  status: "draft" | "submitted" | "under_review" | "interview" | "approved" | "rejected";
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other" | "prefer-not-to-say";
  address: string;
  institution: string;
  designation: string;
  department: string;
  researchAreas: string[];
  qualifications: string;
  experience: string;
  publications?: string;
  achievements?: string;
  referenceNames?: string;
  motivation: string;
  resumeUrl?: string;
  photoUrl?: string;
  adminNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  isAdminRead: boolean;
  emailDeliveryStatus: "pending" | "success" | "failed";
  emailDeliveryError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    type: {
      type: String,
      enum: ["student", "collaborator", "professional", "senior", "fellow", "distinguished_fellow"],
      required: [true, "Application type is required"],
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "under_review", "interview", "approved", "rejected"],
      default: "submitted",
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: 150,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    dateOfBirth: {
      type: String,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
      required: [true, "Gender is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: 500,
    },
    institution: {
      type: String,
      required: [true, "Institution is required"],
      trim: true,
      maxlength: 200,
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
      maxlength: 150,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      maxlength: 150,
    },
    researchAreas: {
      type: [String],
      required: [true, "At least one research area is required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "At least one research area is required",
      },
    },
    qualifications: {
      type: String,
      required: [true, "Qualifications are required"],
      trim: true,
    },
    experience: {
      type: String,
      required: [true, "Experience is required"],
      trim: true,
    },
    publications: {
      type: String,
      trim: true,
      default: null,
    },
    achievements: {
      type: String,
      trim: true,
      default: null,
    },
    referenceNames: {
      type: String,
      trim: true,
      default: null,
    },
    motivation: {
      type: String,
      required: [true, "Motivation statement is required"],
      trim: true,
      maxlength: 3000,
    },
    resumeUrl: {
      type: String,
      default: null,
    },
    photoUrl: {
      type: String,
      default: null,
    },
    adminNotes: {
      type: String,
      trim: true,
      default: null,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    isAdminRead: {
      type: Boolean,
      default: false,
    },
    emailDeliveryStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    emailDeliveryError: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for admin queries
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ type: 1 });
ApplicationSchema.index({ status: 1, type: 1 });
ApplicationSchema.index({ email: 1 });
ApplicationSchema.index({ createdAt: -1 });

const Application: Model<IApplication> =
  mongoose.models.Application ||
  mongoose.model<IApplication>("Application", ApplicationSchema);

export default Application;
