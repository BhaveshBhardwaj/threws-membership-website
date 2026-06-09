"use server";

import dbConnect from "@/lib/db";
import Application from "@/models/Application";
import { auth } from "@/lib/auth";
import { applicationSchema } from "@/lib/validations";
import {
  sendApplicationNotification,
  sendApplicationAcknowledgementEmail,
  sendApplicationRejectionEmail,
} from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { headers } from "next/headers";
import type { ApiResponse, ApplicationFormData } from "@/types";
import type { IApplication } from "@/models/Application";

/* ────────────────────── Public: Submit Application ─────────────────── */

export async function submitApplication(
  data: ApplicationFormData
): Promise<ApiResponse<{ id: string }>> {
  try {
    // Rate limit by IP
    const headersList = await headers();
    const ip = getClientIp(headersList);
    const limit = rateLimit(ip, "form");

    if (!limit.success) {
      return {
        success: false,
        error: `Too many submissions. Please try again in ${Math.ceil(limit.resetMs / 1000)} seconds.`,
      };
    }

    // Validate input
    const parsed = applicationSchema.safeParse(data);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Validation failed",
      };
    }

    await dbConnect();

    // Check for duplicate email with pending application
    const existing = await Application.findOne({
      email: parsed.data.email,
      status: "submitted",
    });

    if (existing) {
      return {
        success: false,
        error: "You already have a pending application. Please wait for it to be reviewed.",
      };
    }

    // Create application
    const application = await Application.create({
      ...parsed.data,
      status: "submitted",
      isAdminRead: false,
      emailDeliveryStatus: "pending",
    });

    // Send email notification synchronously, catch SMTP errors, and update DB
    try {
      await sendApplicationNotification(parsed.data);
      await sendApplicationAcknowledgementEmail(parsed.data.email, parsed.data.fullName, parsed.data.type);
      
      await Application.findByIdAndUpdate(application._id, {
        emailDeliveryStatus: "success",
      });
    } catch (err: any) {
      console.error("Failed to send application notification email:", err);
      await Application.findByIdAndUpdate(application._id, {
        emailDeliveryStatus: "failed",
        emailDeliveryError: err?.message || String(err),
      });
    }

    return {
      success: true,
      data: { id: application._id.toString() },
      message: "Application submitted successfully! We will review it and get back to you.",
    };
  } catch (error) {
    console.error("submitApplication error:", error);
    return {
      success: false,
      error: "Failed to submit application. Please try again.",
    };
  }
}

/* ────────────── Admin: Get Applications (with filters) ─────────────── */

interface GetApplicationsParams {
  page?: number;
  limit?: number;
  status?: "draft" | "submitted" | "under_review" | "interview" | "approved" | "rejected";
  type?: "student" | "collaborator" | "professional" | "senior" | "fellow" | "distinguished_fellow";
  search?: string;
}

export async function getApplications(
  params: GetApplicationsParams = {}
): Promise<ApiResponse<IApplication[]>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const {
      page = 1,
      limit = 20,
      status,
      type,
      search,
    } = params;

    await dbConnect();

    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { institution: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("reviewedBy", "name email")
        .lean(),
      Application.countDocuments(filter),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(applications)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("getApplications error:", error);
    return { success: false, error: "Failed to fetch applications" };
  }
}

/* ────────────── Admin: Update Application Status ────────────────────── */

export async function updateApplicationStatus(
  applicationId: string,
  status: "draft" | "submitted" | "under_review" | "interview" | "approved" | "rejected",
  adminNotes?: string
): Promise<ApiResponse<IApplication>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    const existing = await Application.findById(applicationId).lean();
    if (!existing) {
      return { success: false, error: "Application not found" };
    }

    const updateData: Record<string, unknown> = {
      status,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
      isAdminRead: true,
    };

    if (adminNotes !== undefined) {
      const trimmedNotes = adminNotes.trim();
      updateData.adminNotes = trimmedNotes ? trimmedNotes : null;
    }

    const application = await Application.findByIdAndUpdate(
      applicationId,
      updateData,
      { returnDocument: "after", runValidators: true }
    ).lean();

    if (!application) {
      return { success: false, error: "Application not found" };
    }

    // Notify applicant by email for decision statuses only
    if (status === "rejected") {
      try {
        await sendApplicationRejectionEmail(
          application.email,
          application.fullName,
          application.type,
          adminNotes
        );
      } catch (emailErr) {
        console.error("Failed to send application rejection email:", emailErr);
      }
    }

    // Auto-create member profile on approval
    if (status === "approved") {
      try {
        const { createMemberFromApplication } = await import("./member.actions");
        const memberResult = await createMemberFromApplication(applicationId);
        if (!memberResult.success) {
          console.error("Auto-member creation failed during status update:", memberResult.error);
        }
      } catch (memberErr) {
        console.error("Failed to dynamically invoke member creation:", memberErr);
      }
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(application)),
      message: `Application ${status} successfully`,
    };
  } catch (error) {
    console.error("updateApplicationStatus error:", error);
    return { success: false, error: "Failed to update application status" };
  }
}


/* ────────────── Admin: Delete Application ───────────────────────────── */

export async function deleteApplication(
  applicationId: string
): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    const application = await Application.findByIdAndDelete(applicationId);

    if (!application) {
      return { success: false, error: "Application not found" };
    }

    return {
      success: true,
      message: "Application deleted successfully",
    };
  } catch (error) {
    console.error("deleteApplication error:", error);
    return { success: false, error: "Failed to delete application" };
  }
}

/* ────────────── Admin: Mark Application as Read ─────────────────────── */

export async function markApplicationAsRead(
  applicationId: string
): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    const application = await Application.findByIdAndUpdate(
      applicationId,
      { isAdminRead: true },
      { returnDocument: "after" }
    );

    if (!application) {
      return { success: false, error: "Application not found" };
    }

    return {
      success: true,
      message: "Application marked as read",
    };
  } catch (error) {
    console.error("markApplicationAsRead error:", error);
    return { success: false, error: "Failed to mark application as read" };
  }
}

/* ────────────── Admin: Retry Application Email ──────────────────────── */

export async function retryApplicationEmail(
  applicationId: string
): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    const application = await Application.findById(applicationId);
    if (!application) {
      return { success: false, error: "Application not found" };
    }

    try {
      await sendApplicationNotification(application);
      await sendApplicationAcknowledgementEmail(
        application.email,
        application.fullName,
        application.type
      );
      await Application.findByIdAndUpdate(applicationId, {
        emailDeliveryStatus: "success",
        emailDeliveryError: null,
      });
      return {
        success: true,
        message: "Admin and applicant notification emails resent successfully!",
      };
    } catch (err: any) {
      console.error("Resend email failed:", err);
      await Application.findByIdAndUpdate(applicationId, {
        emailDeliveryStatus: "failed",
        emailDeliveryError: err?.message || String(err),
      });
      return {
        success: false,
        error: `Resend failed: ${err?.message || String(err)}`,
      };
    }
  } catch (error) {
    console.error("retryApplicationEmail error:", error);
    return { success: false, error: "Failed to retry email dispatch" };
  }
}

/* ────────────── Admin: Get Unread Count ─────────────────────────────── */

export async function getUnreadApplicationsCount(): Promise<ApiResponse<number>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    const count = await Application.countDocuments({
      status: "submitted",
      isAdminRead: false,
    });

    return {
      success: true,
      data: count,
    };
  } catch (error) {
    console.error("getUnreadApplicationsCount error:", error);
    return { success: false, error: "Failed to fetch unread application count" };
  }
}

