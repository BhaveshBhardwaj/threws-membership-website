import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ITestimonial extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  designation: string;
  institution: string;
  text: string;
  photoUrl?: string;
  type: "testimonial" | "highlight" | "spotlight";
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
      maxlength: 150,
    },
    institution: {
      type: String,
      required: [true, "Institution is required"],
      trim: true,
      maxlength: 200,
    },
    text: {
      type: String,
      required: [true, "Quote/Bio/Highlight text is required"],
      trim: true,
      maxlength: 2000,
    },
    photoUrl: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["testimonial", "highlight", "spotlight"],
      required: [true, "Type is required"],
      default: "testimonial",
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

TestimonialSchema.index({ type: 1, featured: 1 });

const Testimonial: Model<ITestimonial> =
  mongoose.models.Testimonial ||
  mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);

export default Testimonial;
