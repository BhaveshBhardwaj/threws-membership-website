import { z } from "zod";

/* ────────────────── Shared sub-schemas ────────────────── */

const phoneRegex = /^[+]?[\d\s\-()]{7,20}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const baseApplicationSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(150).trim(),
  email: z.string().email("Invalid email address").max(254).trim().toLowerCase(),
  phone: z.string().regex(phoneRegex, "Invalid phone number").trim(),
  dateOfBirth: z.string().regex(dateRegex, "Date must be YYYY-MM-DD"),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]),
  address: z.string().min(5).max(500).trim(),
  institution: z.string().min(2).max(200).trim(),
  designation: z.string().min(2).max(150).trim(),
  department: z.string().min(2).max(150).trim(),
  researchAreas: z.array(z.string().min(1).max(100).trim()).min(1).max(10),
  qualifications: z.string().min(5).max(2000).trim(),
  experience: z.string().min(5).max(2000).trim(),
  motivation: z.string().min(20).max(3000).trim(),
  resumeUrl: z.string().optional().or(z.literal("")),
  photoUrl: z.string().optional().or(z.literal("")),
});

export const studentApplicationSchema = baseApplicationSchema.extend({
  type: z.literal("student"),
});

export const collaboratorApplicationSchema = baseApplicationSchema.extend({
  type: z.literal("collaborator"),
});

export const professionalApplicationSchema = baseApplicationSchema.extend({
  type: z.literal("professional"),
  publications: z.string().optional().or(z.literal("")),
});

export const seniorApplicationSchema = baseApplicationSchema.extend({
  type: z.literal("senior"),
  publications: z.string().min(5, "Publications are required").max(3000).trim(),
  achievements: z.string().min(5).max(3000).trim(),
});

export const fellowApplicationSchema = baseApplicationSchema.extend({
  type: z.literal("fellow"),
  publications: z.string().min(5, "Publications are required").max(3000).trim(),
  achievements: z.string().min(5).max(3000).trim(),
  referenceNames: z.string().min(5).max(1000).trim(),
});

export const distinguishedFellowApplicationSchema = baseApplicationSchema.extend({
  type: z.literal("distinguished_fellow"),
  publications: z.string().min(5, "Publications are required").max(3000).trim(),
  achievements: z.string().min(5).max(3000).trim(),
  referenceNames: z.string().min(5).max(1000).trim(),
});

export const applicationSchema = z.discriminatedUnion("type", [
  studentApplicationSchema,
  collaboratorApplicationSchema,
  professionalApplicationSchema,
  seniorApplicationSchema,
  fellowApplicationSchema,
  distinguishedFellowApplicationSchema,
]);

/* ──────────────────── Contact Form ───────────────────── */

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .trim(),
  email: z.string().email("Invalid email address").max(254).trim().toLowerCase(),
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .max(200)
    .trim(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message cannot exceed 5000 characters")
    .trim(),
  phone: z.string().regex(phoneRegex, "Invalid phone number").optional().or(z.literal("")),
});

/* ───────────────────── Blog Post ─────────────────────── */

export const blogPostSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(300)
    .trim(),
  excerpt: z
    .string()
    .min(10, "Excerpt must be at least 10 characters")
    .max(500)
    .trim(),
  content: z.string().min(20, "Content must be at least 20 characters"),
  coverImage: z.string().url().optional().or(z.literal("")),
  author: z.object({
    name: z.string().min(2).max(100).trim(),
    avatar: z.string().url().optional().or(z.literal("")),
  }),
  tags: z.array(z.string().min(1).max(50).trim()).max(15).default([]),
  category: z.string().max(100).trim().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]).default("draft"),
});

/* ───────────────── Hall of Fame ──────────────────────── */

export const hallOfFameSchema = z.object({
  memberId: z.string().optional().or(z.literal("")),
  name: z.string().min(2).max(150).trim(),
  title: z.string().min(2).max(200).trim(),
  institution: z.string().min(2).max(200).trim(),
  achievement: z.string().min(10).max(3000).trim(),
  bio: z.string().max(2000).trim().optional().or(z.literal("")),
  photoUrl: z.string().url().optional().or(z.literal("")),
  category: z.enum(["research", "leadership", "innovation", "community"]),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
  year: z
    .number()
    .int()
    .min(2000, "Year must be 2000 or later")
    .max(2100),
});

/* ────────────────────── Login ────────────────────────── */

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").trim().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters"),
});

/* ───────────────────── Member ───────────────────────── */

export const memberSchema = z.object({
  type: z.enum(["student", "collaborator", "professional", "senior", "fellow", "distinguished_fellow"]),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
  fullName: z.string().min(2).max(150).trim(),
  email: z.string().email().max(254).trim().toLowerCase(),
  phone: z.string().regex(phoneRegex).optional().or(z.literal("")),
  institution: z.string().min(2).max(200).trim(),
  designation: z.string().min(2).max(150).trim(),
  department: z.string().max(150).trim().optional().or(z.literal("")),
  researchAreas: z.array(z.string().min(1).max(100).trim()).default([]),
  photoUrl: z.string().optional().or(z.literal("")),
  bio: z.string().max(2000).trim().optional().or(z.literal("")),
  isHallOfFame: z.boolean().default(false),
  skills: z.array(z.string().min(1).max(50).trim()).default([]),
  achievements: z.string().max(3000).trim().optional().or(z.literal("")),
  publications: z.string().max(3000).trim().optional().or(z.literal("")),
  websiteUrl: z.string().trim().optional().or(z.literal("")),
  linkedinUrl: z.string().trim().optional().or(z.literal("")),
  orcidUrl: z.string().trim().optional().or(z.literal("")),
});

/* ──────────────── Site Setting ───────────────────────── */

export const siteSettingSchema = z.object({
  key: z
    .string()
    .min(1, "Key is required")
    .max(100)
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9._-]+$/,
      "Key may only contain lowercase letters, numbers, dots, hyphens, and underscores"
    ),
  value: z.unknown(),
  description: z.string().max(500).trim().optional().or(z.literal("")),
});

/* ──────────────── Export types inferred from schemas ─── */

export type StudentApplicationInput = z.infer<typeof studentApplicationSchema>;
export type CollaboratorApplicationInput = z.infer<typeof collaboratorApplicationSchema>;
export type ProfessionalApplicationInput = z.infer<typeof professionalApplicationSchema>;
export type SeniorApplicationInput = z.infer<typeof seniorApplicationSchema>;
export type FellowApplicationInput = z.infer<typeof fellowApplicationSchema>;
export type DistinguishedFellowApplicationInput = z.infer<typeof distinguishedFellowApplicationSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type HallOfFameInput = z.infer<typeof hallOfFameSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type MemberInput = z.infer<typeof memberSchema>;
export type SiteSettingInput = z.infer<typeof siteSettingSchema>;
