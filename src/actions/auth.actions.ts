"use server";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import Application from "@/models/Application";
import Member from "@/models/Member";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import type { ApiResponse } from "@/types";

export async function signUpUser(formData: {
  name: string;
  email: string;
  password: string;
}): Promise<ApiResponse> {
  try {
    const { name, email, password } = formData;

    if (!name || !email || !password) {
      return { success: false, error: "Please fill in all fields" };
    }

    if (password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long" };
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user
    await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user",
    });

    return { success: true, message: "Account created successfully! You can now log in." };
  } catch (error: any) {
    console.error("signUpUser error:", error);
    return { success: false, error: error.message || "Failed to create account" };
  }
}

export async function getPortalData(): Promise<ApiResponse<{
  member: any;
  applications: any[];
}>> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    const email = session.user.email.toLowerCase();
    const role = session.user.role;

    // Fetch member profile
    const member = await Member.findOne({ email });

    // Fetch applications: if admin/superadmin, fetch all submissions. Otherwise, only their own.
    let applications;
    if (role === "admin" || role === "superadmin") {
      applications = await Application.find({}).sort({ createdAt: -1 });
    } else {
      applications = await Application.find({ email }).sort({ createdAt: -1 });
    }

    return {
      success: true,
      data: {
        member: member ? JSON.parse(JSON.stringify(member)) : null,
        applications: JSON.parse(JSON.stringify(applications)),
      },
    };
  } catch (error: any) {
    console.error("getPortalData error:", error);
    return { success: false, error: "Failed to load portal data" };
  }
}
