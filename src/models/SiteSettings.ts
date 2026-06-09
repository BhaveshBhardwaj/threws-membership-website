import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ISiteSettings extends Document {
  _id: mongoose.Types.ObjectId;
  key: string;
  value: unknown;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    key: {
      type: String,
      required: [true, "Key is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: [true, "Value is required"],
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

SiteSettingsSchema.index({ key: 1 });

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;
