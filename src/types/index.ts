import { Types } from "mongoose";

/* ────────────────────────────── Application ────────────────────────────── */

export interface ApplicationFormData {
  type: "student" | "collaborator" | "professional" | "senior" | "fellow" | "distinguished_fellow";
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
}

export interface ApplicationDocument extends ApplicationFormData {
  _id: Types.ObjectId;
  status: "draft" | "submitted" | "under_review" | "interview" | "approved" | "rejected";
  adminNotes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  isAdminRead?: boolean;
  emailDeliveryStatus?: "pending" | "success" | "failed";
  emailDeliveryError?: string;
  createdAt: Date;
  updatedAt: Date;
}

/* ─────────────────────────────── Member ─────────────────────────────── */

export interface MemberData {
  _id?: string;
  applicationId?: string;
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
  orgEmailStatus?: "active" | "inactive" | "suspended";
  orgEmailForwardTo?: string;
  orgEmailPassword?: string;
  skills?: string[];
  achievements?: string;
  publications?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  orcidUrl?: string;
  joinedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}



/* ─────────────────────────────── Blog ──────────────────────────────── */

export interface BlogPostData {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: {
    name: string;
    avatar?: string;
  };
  tags: string[];
  category?: string;
  status: "draft" | "published";
  publishedAt?: Date;
  views: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/* ────────────────────────────── Site Settings ───────────────────────── */

export interface SiteSettingData {
  _id?: string;
  key: string;
  value: unknown;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/* ────────────────────────────── Contact Form ────────────────────────── */

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}

/* ────────────────────────────── API Response ────────────────────────── */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/* ────────────────────────────── Pagination ──────────────────────────── */

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
