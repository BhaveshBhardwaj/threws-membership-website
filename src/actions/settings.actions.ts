"use server";

import dbConnect from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import { auth } from "@/lib/auth";
import { siteSettingSchema } from "@/lib/validations";
import type { ApiResponse, SiteSettingData } from "@/types";

/* ────────── Admin: Get All Settings ────────────────────────────────── */

export async function getSettings(): Promise<ApiResponse<SiteSettingData[]>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    const settings = await SiteSettings.find()
      .sort({ key: 1 })
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(settings)),
    };
  } catch (error) {
    console.error("getSettings error:", error);
    return { success: false, error: "Failed to fetch settings" };
  }
}

/* ────────── Superadmin: Update Setting ─────────────────────────────── */

export async function updateSetting(
  data: SiteSettingData
): Promise<ApiResponse<SiteSettingData>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.role !== "superadmin") {
      return { success: false, error: "Only superadmins can modify settings" };
    }

    const parsed = siteSettingSchema.safeParse(data);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Validation failed",
      };
    }

    await dbConnect();

    // Upsert — create if doesn't exist, update if it does
    const setting = await SiteSettings.findOneAndUpdate(
      { key: parsed.data.key },
      {
        key: parsed.data.key,
        value: parsed.data.value,
        description: parsed.data.description || undefined,
      },
      { returnDocument: "after", upsert: true, runValidators: true }
    ).lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(setting)),
      message: `Setting "${parsed.data.key}" updated successfully`,
    };
  } catch (error) {
    console.error("updateSetting error:", error);
    return { success: false, error: "Failed to update setting" };
  }
}

/* ────────── Public: Get a Single Setting by Key ────────────────────── */

export async function getSetting(
  key: string
): Promise<ApiResponse<SiteSettingData>> {
  try {
    await dbConnect();

    const setting = await SiteSettings.findOne({
      key: key.toLowerCase(),
    }).lean();

    if (!setting) {
      return { success: false, error: `Setting "${key}" not found` };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(setting)),
    };
  } catch (error) {
    console.error("getSetting error:", error);
    return { success: false, error: "Failed to fetch setting" };
  }
}
