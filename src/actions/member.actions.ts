"use server";

import dbConnect from "@/lib/db";
import Member from "@/models/Member";
import Application from "@/models/Application";
import { auth } from "@/lib/auth";
import { memberSchema } from "@/lib/validations";
import { generateMembershipId } from "@/lib/utils";
import {
  sendWelcomeOnboardingEmail,
  sendWelcomeApprovalEmail,
  sendMemberStatusChangeEmail,
} from "@/lib/email";
import type { ApiResponse, MemberData } from "@/types";
import type { IMember } from "@/models/Member";

/* ────────── Admin: Get Members (search / filter / paginate) ────────── */

interface GetMembersParams {
  page?: number;
  limit?: number;
  type?: "student" | "collaborator" | "professional" | "senior" | "fellow" | "distinguished_fellow";
  status?: "active" | "inactive" | "suspended";
  search?: string;
}

export async function getMembers(
  params: GetMembersParams = {}
): Promise<ApiResponse<MemberData[]>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const { page = 1, limit = 20, type, status, search } = params;

    await dbConnect();

    const filter: Record<string, any> = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { membershipId: { $regex: search, $options: "i" } },
        { institution: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      Member.find(filter)
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
    console.error("getMembers error:", error);
    return { success: false, error: "Failed to fetch members" };
  }
}

/* ────────── Admin: Create Member from Approved Application ─────────── */

export async function createMemberFromApplication(
  applicationId: string
): Promise<ApiResponse<MemberData>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    // Fetch the application
    const application = await Application.findById(applicationId);
    if (!application) {
      return { success: false, error: "Application not found" };
    }

    if (application.status !== "approved") {
      return {
        success: false,
        error: "Only approved applications can be converted to members",
      };
    }

    // Check if member already exists for this application
    const existingMember = await Member.findOne({ applicationId });
    if (existingMember) {
      return {
        success: false,
        error: "A member record already exists for this application",
      };
    }

    // Count existing members of this type this year to generate ID
    const year = new Date().getFullYear();
    const count = await Member.countDocuments({
      type: application.type,
      membershipId: { $regex: `^THR-(F|HF|DF)-${year}-` },
    });

    const membershipId = generateMembershipId(application.type, count);

    const member = await Member.create({
      applicationId: application._id,
      membershipId,
      type: application.type,
      status: "active",
      fullName: application.fullName,
      email: application.email,
      phone: application.phone,
      institution: application.institution,
      designation: application.designation,
      department: application.department,
      researchAreas: application.researchAreas,
      photoUrl: application.photoUrl,
      joinedAt: new Date(),
    });

    // Trigger SMTP welcome approval notification (credentials self-generated later by user)
    try {
      await sendWelcomeApprovalEmail(
        application.email,
        application.fullName,
        membershipId,
        application.type
      );
    } catch (emailErr) {
      console.error("Failed to send welcome approval email:", emailErr);
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(member)),
      message: `Member activated. ID: ${membershipId}. Welcome notification email has been dispatched.`,
    };
  } catch (error) {
    console.error("createMemberFromApplication error:", error);
    return { success: false, error: "Failed to create member" };
  }
}

/* ────────── Admin: Update Member ───────────────────────────────────── */

export async function updateMember(
  memberId: string,
  data: Partial<MemberData>
): Promise<ApiResponse<MemberData>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate updatable fields
    const parsed = memberSchema.partial().safeParse(data);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Validation failed",
      };
    }

    await dbConnect();

    const existing = await Member.findById(memberId).lean();
    if (!existing) {
      return { success: false, error: "Member not found" };
    }

    const member = await Member.findByIdAndUpdate(
      memberId,
      { ...parsed.data },
      { returnDocument: "after", runValidators: true }
    ).lean();

    if (!member) {
      return { success: false, error: "Member not found" };
    }

    if (
      parsed.data.status &&
      parsed.data.status !== existing.status
    ) {
      try {
        await sendMemberStatusChangeEmail(
          member.email,
          member.fullName,
          member.membershipId,
          parsed.data.status as "active" | "inactive" | "suspended"
        );
      } catch (emailErr) {
        console.error("Failed to send member status change email:", emailErr);
      }
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(member)),
      message: "Member updated successfully",
    };
  } catch (error) {
    console.error("updateMember error:", error);
    return { success: false, error: "Failed to update member" };
  }
}

/* ────────── Superadmin Only: Delete Member ─────────────────────────── */

export async function deleteMember(
  memberId: string
): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.role !== "superadmin") {
      return { success: false, error: "Only superadmins can delete members" };
    }

    await dbConnect();

    const member = await Member.findByIdAndDelete(memberId);

    if (!member) {
      return { success: false, error: "Member not found" };
    }

    return {
      success: true,
      message: "Member deleted successfully",
    };
  } catch (error) {
    console.error("deleteMember error:", error);
    return { success: false, error: "Failed to delete member" };
  }
}

/* ────────── Public: Get Active Members for Display ─────────────────── */

interface GetPublicMembersParams {
  page?: number;
  limit?: number;
  type?: "student" | "collaborator" | "professional" | "senior" | "fellow" | "distinguished_fellow";
  search?: string;
}

export async function getPublicMembers(
  params: GetPublicMembersParams = {}
): Promise<ApiResponse<MemberData[]>> {
  try {
    const { page = 1, limit = 50, type, search } = params;

    await dbConnect();

    const filter: Record<string, any> = { status: "active" };
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { institution: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
        { researchAreas: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      Member.find(filter)
        .select("fullName membershipId type institution designation department researchAreas photoUrl bio joinedAt")
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
    console.error("getPublicMembers error:", error);
    return { success: false, error: "Failed to fetch members" };
  }
}

/* ────────── User: Update Own Member Profile ─────────────────────────── */

export async function updateMemberProfile(
  data: Partial<MemberData>
): Promise<ApiResponse<MemberData>> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const email = session.user.email.toLowerCase();

    await dbConnect();

    // Find the member profile
    const member = await Member.findOne({ email });
    if (!member) {
      return { success: false, error: "Member profile not found." };
    }

    // Only allow updating profile fields
    const updatableFields = {
      bio: data.bio,
      skills: data.skills,
      achievements: data.achievements,
      publications: data.publications,
      websiteUrl: data.websiteUrl,
      linkedinUrl: data.linkedinUrl,
      orcidUrl: data.orcidUrl,
      photoUrl: data.photoUrl,
    };

    const updatedMember = await Member.findByIdAndUpdate(
      member._id,
      { $set: updatableFields },
      { returnDocument: "after", runValidators: true }
    ).lean();

    if (!updatedMember) {
      return { success: false, error: "Failed to update profile." };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedMember)),
      message: "Academic profile updated successfully!",
    };
  } catch (error: any) {
    console.error("updateMemberProfile error:", error);
    return { success: false, error: error.message || "Failed to update profile." };
  }
}

/* ────────── User: Self-Provision Organization Email ────────────────── */

export async function selfProvisionOrgEmail(): Promise<ApiResponse<MemberData>> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const email = session.user.email.toLowerCase();

    await dbConnect();

    // Find the member profile
    const member = await Member.findOne({ email });
    if (!member) {
      return { success: false, error: "Member profile not found. Please verify your fellowship application is approved." };
    }

    if (member.orgEmail) {
      return { success: false, error: "Credentials have already been generated for your account." };
    }

    // Generate unique, professional organization email in format name + wbr @gmail.com
    const nameTokens = member.fullName
      .toLowerCase()
      .replace(/^(dr|prof|mr|ms|mrs)\.?\s+/i, "") // strip standard titles
      .replace(/[^a-z0-9\s]/g, "") // remove special characters
      .split(/\s+/)
      .filter(Boolean);

    let orgEmail = "";
    if (nameTokens.length > 0) {
      const firstName = nameTokens[0];
      const lastName = nameTokens.length > 1 ? nameTokens[nameTokens.length - 1] : "";
      
      const candidate1 = lastName ? `${firstName}.${lastName}.wbr` : `${firstName}.wbr`;
      const candidate2 = `${firstName}.wbr`;
      
      let selectedLocalPart = candidate1;
      
      // Collision search checks
      const exists1 = await Member.findOne({ orgEmail: `${candidate1}@gmail.com` });
      if (exists1) {
        const exists2 = await Member.findOne({ orgEmail: `${candidate2}@gmail.com` });
        if (exists2) {
          // Increment number logic if both local parts are taken
          let num = 2;
          while (true) {
            const nextCandidate = `${candidate1}${num}`;
            const existsNext = await Member.findOne({ orgEmail: `${nextCandidate}@gmail.com` });
            if (!existsNext) {
              selectedLocalPart = nextCandidate;
              break;
            }
            num++;
          }
        } else {
          selectedLocalPart = candidate2;
        }
      }
      
      orgEmail = `${selectedLocalPart}@gmail.com`;
    } else {
      // Fallback in case of weird full name characters
      orgEmail = `member.${member.membershipId.toLowerCase()}.wbr@gmail.com`;
    }

    // Generate secure, unique Email Password
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#%";
    let orgEmailPassword = "wr-";
    for (let i = 0; i < 8; i++) {
      orgEmailPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Save in database
    const updatedMember = await Member.findByIdAndUpdate(
      member._id,
      { 
        orgEmail,
        orgEmailPassword,
        orgEmailStatus: "active",
        orgEmailForwardTo: email
      },
      { returnDocument: "after" }
    ).lean();

    if (!updatedMember) {
      return { success: false, error: "Failed to generate credentials." };
    }

    // Trigger onboarding welcome SMTP email
    try {
      await sendWelcomeOnboardingEmail(
        email,
        member.fullName,
        orgEmail,
        orgEmailPassword,
        member.membershipId,
        member.type
      );
    } catch (emailErr) {
      console.error("Failed to send welcome email in self-provision:", emailErr);
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedMember)),
      message: "Academic WBR credentials provisioned successfully!",
    };
  } catch (error: any) {
    console.error("selfProvisionOrgEmail error:", error);
    return { success: false, error: error.message || "Failed to provision credentials." };
  }
}

/* ────────── Public: Verify Member by ID or Email ───────────────────── */

export async function verifyMember(
  query: string
): Promise<ApiResponse<MemberData>> {
  try {
    if (!query || !query.trim()) {
      return { success: false, error: "Please enter a Member ID or Email." };
    }

    await dbConnect();

    const cleanQuery = query.trim();

    // Search for active member by membershipId, email, or orgEmail
    const member = await Member.findOne({
      status: "active",
      $or: [
        { membershipId: { $regex: new RegExp(`^${cleanQuery}$`, "i") } },
        { email: { $regex: new RegExp(`^${cleanQuery}$`, "i") } },
        { orgEmail: { $regex: new RegExp(`^${cleanQuery}$`, "i") } },
      ],
    }).lean();

    if (!member) {
      return { success: false, error: "No active member found with this ID or Email." };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(member)),
    };
  } catch (error: any) {
    console.error("verifyMember error:", error);
    return { success: false, error: "An unexpected error occurred during verification." };
  }
}
