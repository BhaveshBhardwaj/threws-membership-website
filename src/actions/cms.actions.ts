"use server";

import dbConnect from "@/lib/db";
import CMSSection from "@/models/CMSSection";
import Project from "@/models/Project";
import Event from "@/models/Event";
import Testimonial from "@/models/Testimonial";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/types";

/* =========================================================================
   1. CMS SECTIONS (DYNAMIC LANDING PAGE SECTIONS)
   ========================================================================= */

export async function getCMSSections(): Promise<ApiResponse<any[]>> {
  try {
    await dbConnect();
    const sections = await CMSSection.find().sort({ order: 1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(sections)) };
  } catch (error) {
    console.error("getCMSSections error:", error);
    return { success: false, error: "Failed to load page sections" };
  }
}

export async function getCMSSection(key: string): Promise<ApiResponse<any>> {
  try {
    await dbConnect();
    const section = await CMSSection.findOne({ key: key.toLowerCase() }).lean();
    if (!section) {
      return { success: false, error: `Section "${key}" not found` };
    }
    return { success: true, data: JSON.parse(JSON.stringify(section)) };
  } catch (error) {
    console.error("getCMSSection error:", error);
    return { success: false, error: "Failed to load section" };
  }
}

export async function updateCMSSection(
  key: string,
  data: {
    title: string;
    subtitle?: string;
    content?: string;
    image?: string;
    order?: number;
    isActive?: boolean;
    metadata?: Record<string, any>;
  }
): Promise<ApiResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    const section = await CMSSection.findOneAndUpdate(
      { key: key.toLowerCase() },
      { $set: data },
      { returnDocument: "after", upsert: true, runValidators: true }
    ).lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(section)),
      message: `Section "${key}" updated successfully!`,
    };
  } catch (error) {
    console.error("updateCMSSection error:", error);
    return { success: false, error: "Failed to update page section" };
  }
}

/* =========================================================================
   2. PROJECTS / PUBLICATIONS SHOWCASE
   ========================================================================= */

export async function getProjects(params?: { featured?: boolean }): Promise<ApiResponse<any[]>> {
  try {
    await dbConnect();
    const filter = params?.featured ? { featured: true } : {};
    const projects = await Project.find(filter).sort({ year: -1, createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(projects)) };
  } catch (error) {
    console.error("getProjects error:", error);
    return { success: false, error: "Failed to load projects/publications" };
  }
}

export async function createProject(data: {
  title: string;
  description: string;
  authors: string;
  journal?: string;
  link?: string;
  year: number;
  image?: string;
  featured?: boolean;
}): Promise<ApiResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();
    const project = await Project.create(data);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(project)),
      message: "Publication/Project added successfully!",
    };
  } catch (error) {
    console.error("createProject error:", error);
    return { success: false, error: "Failed to add project/publication" };
  }
}

export async function updateProject(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    authors: string;
    journal?: string;
    link?: string;
    year: number;
    image?: string;
    featured?: boolean;
  }>
): Promise<ApiResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();
    const project = await Project.findByIdAndUpdate(id, { $set: data }, { returnDocument: "after", runValidators: true }).lean();

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(project)),
      message: "Project/Publication updated successfully!",
    };
  } catch (error) {
    console.error("updateProject error:", error);
    return { success: false, error: "Failed to update project" };
  }
}

export async function deleteProject(id: string): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    return { success: true, message: "Project deleted successfully" };
  } catch (error) {
    console.error("deleteProject error:", error);
    return { success: false, error: "Failed to delete project" };
  }
}

/* =========================================================================
   3. EVENTS, MILESTONES, ACHIEVEMENTS, COLLABORATIONS
   ========================================================================= */

export async function getEvents(type?: string): Promise<ApiResponse<any[]>> {
  try {
    await dbConnect();
    const filter: Record<string, any> = type ? { type } : {};
    const events = await Event.find(filter).sort({ date: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(events)) };
  } catch (error) {
    console.error("getEvents error:", error);
    return { success: false, error: "Failed to load events/announcements" };
  }
}

export async function createEvent(data: {
  title: string;
  description: string;
  date: Date | string;
  location?: string;
  type: "event" | "announcement" | "milestone" | "achievement" | "collaboration";
  image?: string;
  link?: string;
}): Promise<ApiResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();
    const event = await Event.create({
      ...data,
      date: new Date(data.date),
    });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(event)),
      message: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} added successfully!`,
    };
  } catch (error) {
    console.error("createEvent error:", error);
    return { success: false, error: "Failed to add event/announcement" };
  }
}

export async function updateEvent(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    date: Date | string;
    location?: string;
    type: "event" | "announcement" | "milestone" | "achievement" | "collaboration";
    image?: string;
    link?: string;
  }>
): Promise<ApiResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();
    const updateData = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    const event = await Event.findByIdAndUpdate(id, { $set: updateData }, { returnDocument: "after", runValidators: true }).lean();

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(event)),
      message: "Updated successfully!",
    };
  } catch (error) {
    console.error("updateEvent error:", error);
    return { success: false, error: "Failed to update details" };
  }
}

export async function deleteEvent(id: string): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return { success: false, error: "Not found" };
    }

    return { success: true, message: "Deleted successfully" };
  } catch (error) {
    console.error("deleteEvent error:", error);
    return { success: false, error: "Failed to delete" };
  }
}

/* =========================================================================
   4. TESTIMONIALS, HIGHLIGHTS, MEMBER SPOTLIGHTS
   ========================================================================= */

export async function getTestimonials(type?: string): Promise<ApiResponse<any[]>> {
  try {
    await dbConnect();
    const filter: Record<string, any> = type ? { type } : {};
    const testimonials = await Testimonial.find(filter).sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(testimonials)) };
  } catch (error) {
    console.error("getTestimonials error:", error);
    return { success: false, error: "Failed to load testimonials/spotlights" };
  }
}

export async function createTestimonial(data: {
  name: string;
  designation: string;
  institution: string;
  text: string;
  photoUrl?: string;
  type: "testimonial" | "highlight" | "spotlight";
  featured?: boolean;
}): Promise<ApiResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();
    const testimonial = await Testimonial.create(data);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(testimonial)),
      message: "Member spotlight/testimonial added successfully!",
    };
  } catch (error) {
    console.error("createTestimonial error:", error);
    return { success: false, error: "Failed to add spotlight/testimonial" };
  }
}

export async function updateTestimonial(
  id: string,
  data: Partial<{
    name: string;
    designation: string;
    institution: string;
    text: string;
    photoUrl?: string;
    type: "testimonial" | "highlight" | "spotlight";
    featured?: boolean;
  }>
): Promise<ApiResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();
    const testimonial = await Testimonial.findByIdAndUpdate(id, { $set: data }, { returnDocument: "after", runValidators: true }).lean();

    if (!testimonial) {
      return { success: false, error: "Not found" };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(testimonial)),
      message: "Updated successfully!",
    };
  } catch (error) {
    console.error("updateTestimonial error:", error);
    return { success: false, error: "Failed to update" };
  }
}

export async function deleteTestimonial(id: string): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();
    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      return { success: false, error: "Not found" };
    }

    return { success: true, message: "Deleted successfully" };
  } catch (error) {
    console.error("deleteTestimonial error:", error);
    return { success: false, error: "Failed to delete" };
  }
}
