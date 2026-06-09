import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IMember extends Document {
  _id: mongoose.Types.ObjectId;
  applicationId?: mongoose.Types.ObjectId;
  membershipId: string;
  type: "student" | "collaborator" | "professional" | "senior" | "fellow" | "distinguished_fellow";
  status: "active" | "inactive" | "suspended";
  fullName: string;
  email: string;
  phone?: string;
  institution: string;
  designation: string;
  department?: string;
  researchAreas: string[];
  photoUrl?: string;
  bio?: string;

  orgEmail?: string;
  orgEmailStatus: "active" | "inactive" | "suspended";
  orgEmailForwardTo?: string;
  orgEmailPassword?: string;
  skills: string[];
  achievements?: string;
  publications?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  orcidUrl?: string;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      default: null,
    },
    membershipId: {
      type: String,
      required: [true, "Membership ID is required"],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["student", "collaborator", "professional", "senior", "fellow", "distinguished_fellow"],
      required: [true, "Membership type is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
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
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    institution: {
      type: String,
      required: [true, "Institution is required"],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    department: {
      type: String,
      trim: true,
      default: null,
    },
    researchAreas: {
      type: [String],
      default: [],
    },
    photoUrl: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },

    orgEmail: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    orgEmailStatus: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    orgEmailForwardTo: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    orgEmailPassword: {
      type: String,
      default: null,
    },
    skills: {
      type: [String],
      default: [],
    },
    achievements: {
      type: String,
      trim: true,
      default: null,
    },
    publications: {
      type: String,
      trim: true,
      default: null,
    },
    websiteUrl: {
      type: String,
      trim: true,
      default: null,
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: null,
    },
    orcidUrl: {
      type: String,
      trim: true,
      default: null,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

MemberSchema.index({ status: 1 });
MemberSchema.index({ type: 1 });
MemberSchema.index({ orgEmail: 1 }, { unique: true, sparse: true });
MemberSchema.index({ fullName: "text", institution: "text" });

const Member: Model<IMember> =
  mongoose.models.Member || mongoose.model<IMember>("Member", MemberSchema);

export default Member;
