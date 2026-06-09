import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IEvent extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  date: Date;
  location?: string;
  type: "event" | "announcement" | "milestone" | "achievement" | "collaboration";
  image?: string;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: 3000,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      enum: ["event", "announcement", "milestone", "achievement", "collaboration"],
      required: [true, "Type is required"],
    },
    image: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

EventSchema.index({ type: 1, date: -1 });
EventSchema.index({ date: -1 });

const Event: Model<IEvent> =
  mongoose.models.Event ||
  mongoose.model<IEvent>("Event", EventSchema);

export default Event;
