import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IPublication extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  authors: mongoose.Types.ObjectId[];
  abstract: string;
  publicationDate: Date;
  type: "research_paper" | "white_paper" | "conference_proceeding" | "student_project" | "featured_research";
  doi?: string;
  fileUrl?: string;
  externalUrl?: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const PublicationSchema = new Schema<IPublication>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 300,
    },
    authors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    abstract: {
      type: String,
      required: [true, "Abstract is required"],
      trim: true,
    },
    publicationDate: {
      type: Date,
      required: [true, "Publication date is required"],
    },
    type: {
      type: String,
      enum: ["research_paper", "white_paper", "conference_proceeding", "student_project", "featured_research"],
      required: [true, "Publication type is required"],
    },
    doi: {
      type: String,
      trim: true,
      default: null,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    externalUrl: {
      type: String,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

PublicationSchema.index({ status: 1 });
PublicationSchema.index({ type: 1 });
PublicationSchema.index({ title: "text", abstract: "text" });

const Publication: Model<IPublication> =
  mongoose.models.Publication ||
  mongoose.model<IPublication>("Publication", PublicationSchema);

export default Publication;
