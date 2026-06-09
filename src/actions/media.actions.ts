"use server";

import fs from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/types";

export interface MediaFile {
  name: string;
  url: string;
  size: number;
  updatedAt: string;
}

/* ────────── Admin: Get List of Media Files ────────────────────────── */

export async function getMediaFiles(): Promise<ApiResponse<MediaFile[]>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Check if directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      return { success: true, data: [] }; // No uploads yet
    }

    const files = await fs.readdir(uploadDir);
    const mediaFiles: MediaFile[] = [];

    for (const file of files) {
      if (file.startsWith(".")) continue; // Skip hidden/system files

      const filePath = path.join(uploadDir, file);
      const stat = await fs.stat(filePath);

      if (stat.isFile()) {
        mediaFiles.push({
          name: file,
          url: `/uploads/${file}`,
          size: stat.size,
          updatedAt: stat.mtime.toISOString(),
        });
      }
    }

    // Sort by last modified date (newest first)
    mediaFiles.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return {
      success: true,
      data: mediaFiles,
    };
  } catch (error) {
    console.error("getMediaFiles error:", error);
    return { success: false, error: "Failed to load uploads folder" };
  }
}

/* ────────── Admin: Securely Delete Uploaded File ───────────────────── */

export async function deleteMediaFile(filename: string): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Sanitize filename to prevent directory traversal attacks (e.g. filename = "../../../config.js")
    const safeName = path.basename(filename);
    const filePath = path.join(process.cwd(), "public", "uploads", safeName);

    try {
      await fs.unlink(filePath);
      return {
        success: true,
        message: `File "${safeName}" deleted successfully`,
      };
    } catch (err: any) {
      console.error("Unlink error:", err);
      return { success: false, error: "File not found or already deleted from disk" };
    }
  } catch (error) {
    console.error("deleteMediaFile error:", error);
    return { success: false, error: "Failed to delete file from disk" };
  }
}
