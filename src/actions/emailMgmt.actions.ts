"use server";

import dbConnect from "@/lib/db";
import Member from "@/models/Member";
import { auth } from "@/lib/auth";
import {
  sendWelcomeOnboardingEmail,
  sendOrgEmailStatusChangeEmail,
} from "@/lib/email";
import type { ApiResponse, MemberData } from "@/types";

interface GetOrgEmailsParams {
  page?: number;
  limit?: number;
  status?: "active" | "inactive" | "suspended" | "";
  search?: string;
}

/**
 * Admin action to fetch members with provisioned org emails
 */
export async function getOrgEmails(
  params: GetOrgEmailsParams = {}
): Promise<ApiResponse<MemberData[]>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const { page = 1, limit = 20, status, search } = params;

    await dbConnect();

    // Only query members that have an orgEmail generated
    const filter: Record<string, any> = { orgEmail: { $ne: null } };
    
    if (status) {
      filter.orgEmailStatus = status;
    }
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { orgEmail: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { membershipId: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      Member.find(filter)
        .select("fullName membershipId type email orgEmail orgEmailStatus orgEmailForwardTo orgEmailPassword joinedAt")
        .sort({ joinedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Member.countDocuments(filter),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(members)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("getOrgEmails error:", error);
    return { success: false, error: "Failed to fetch organization emails" };
  }
}

/**
 * Admin action to update a member's org email state
 */
export async function updateOrgEmailStatus(
  memberId: string,
  status: "active" | "inactive" | "suspended"
): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const role = session.user.role;
    if (role !== "admin" && role !== "superadmin") {
      return { success: false, error: "Only authorized administrators can manage emails" };
    }

    await dbConnect();

    const existing = await Member.findById(memberId);
    if (!existing) {
      return { success: false, error: "Member profile not found" };
    }

    const member = await Member.findByIdAndUpdate(
      memberId,
      { orgEmailStatus: status },
      { returnDocument: "after" }
    );

    if (!member) {
      return { success: false, error: "Member profile not found" };
    }

    if (member.orgEmail && existing.orgEmailStatus !== status) {
      try {
        await sendOrgEmailStatusChangeEmail(
          member.email,
          member.fullName,
          member.orgEmail,
          status
        );
      } catch (emailErr) {
        console.error("Failed to send org email status notification:", emailErr);
      }
    }

    return {
      success: true,
      message: `Organization email status set to ${status}`,
    };
  } catch (error) {
    console.error("updateOrgEmailStatus error:", error);
    return { success: false, error: "Failed to update email status" };
  }
}

/**
 * Admin action to configure destination forwarding
 */
export async function updateOrgEmailForwarding(
  memberId: string,
  forwardTo: string
): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const role = session.user.role;
    if (role !== "admin" && role !== "superadmin") {
      return { success: false, error: "Only authorized administrators can manage forwarding" };
    }

    const cleanedEmail = forwardTo.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanedEmail)) {
      return { success: false, error: "Please enter a valid forwarding email address" };
    }

    await dbConnect();

    const member = await Member.findByIdAndUpdate(
      memberId,
      { orgEmailForwardTo: cleanedEmail },
      { returnDocument: "after" }
    );

    if (!member) {
      return { success: false, error: "Member profile not found" };
    }

    return {
      success: true,
      message: `Email forwarding successfully updated to: ${cleanedEmail}`,
    };
  } catch (error) {
    console.error("updateOrgEmailForwarding error:", error);
    return { success: false, error: "Failed to configure forwarding" };
  }
}

/**
 * Admin action to manually resend onboarding welcome credentials
 */
export async function resendWelcomeEmail(
  memberId: string
): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    const member = await Member.findById(memberId);
    if (!member) {
      return { success: false, error: "Member profile not found" };
    }

    if (!member.orgEmail) {
      return { success: false, error: "No organization email has been provisioned for this member" };
    }

    // Trigger onboarding SMTP welcome email dispatch
    await sendWelcomeOnboardingEmail(
      member.email,
      member.fullName,
      member.orgEmail,
      member.orgEmailPassword || "",
      member.membershipId,
      member.type
    );

    return {
      success: true,
      message: `Onboarding welcome credentials resent successfully to ${member.email}!`,
    };
  } catch (error: any) {
    console.error("resendWelcomeEmail error:", error);
    return { success: false, error: error?.message || "Failed to resend credentials" };
  }
}
