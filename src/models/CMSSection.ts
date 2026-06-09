import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ICMSSection extends Document {
  _id: mongoose.Types.ObjectId;
  key: string; // unique, e.g. "hero", "about", "stats"
  title: string;
  subtitle?: string;
  content?: string;
  image?: string;
  order: number;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const CMSSectionSchema = new Schema<ICMSSection>(
  {
    key: {
      type: String,
      required: [true, "Section key is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
      default: "",
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

CMSSectionSchema.index({ key: 1 });
CMSSectionSchema.index({ order: 1 });

const CMSSection: Model<ICMSSection> =
  mongoose.models.CMSSection ||
  mongoose.model<ICMSSection>("CMSSection", CMSSectionSchema);

export default CMSSection;
