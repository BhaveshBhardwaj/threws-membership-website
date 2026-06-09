"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import type { ApiResponse } from "@/types";
import { getAppBaseUrl } from "@/lib/app-url";

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const GENERIC_SUCCESS_MESSAGE =
  "If an account exists with that email, you will receive a password reset link shortly.";

function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(email: string): Promise<ApiResponse> {
  try {
    const headersList = await headers();
    const ip = getClientIp(headersList);
    const limit = rateLimit(`forgot:${ip}`, "login");

    if (!limit.success) {
      return {
        success: false,
        error: `Too many requests. Please try again in ${Math.ceil(limit.resetMs / 1000)} seconds.`,
      };
    }

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Invalid email address",
      };
    }

    const normalizedEmail = parsed.data.email;

    await dbConnect();

    const user = await User.findOne({ email: normalizedEmail }).select("_id name email");

    if (user) {
      const rawToken = crypto.randomBytes(32).toString("base64url");
      const tokenHash = hashResetToken(rawToken);
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

      await PasswordResetToken.deleteMany({
        userId: user._id,
        usedAt: null,
      });

      await PasswordResetToken.create({
        userId: user._id,
        tokenHash,
        expiresAt,
      });

      const resetUrl = `${getAppBaseUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`;

      try {
        await sendPasswordResetEmail(user.email, user.name, resetUrl);
      } catch (emailError) {
        console.error("requestPasswordReset email error:", emailError);
        await PasswordResetToken.deleteOne({ tokenHash });
        return {
          success: false,
          error:
            "We could not send the reset email. Please check SMTP settings and try again later.",
        };
      }
    }

    return { success: true, message: GENERIC_SUCCESS_MESSAGE };
  } catch (error: unknown) {
    console.error("requestPasswordReset error:", error);
    return { success: false, error: "Something went wrong. Please try again later." };
  }
}

export async function resetPasswordWithToken(
  token: string,
  password: string
): Promise<ApiResponse> {
  try {
    const parsed = resetPasswordSchema.safeParse({ token, password });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Invalid input",
      };
    }

    await dbConnect();

    const tokenHash = hashResetToken(parsed.data.token);
    const resetRecord = await PasswordResetToken.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return {
        success: false,
        error: "This reset link is invalid or has expired. Please request a new one.",
      };
    }

    const user = await User.findById(resetRecord.userId).select("+password");
    if (!user) {
      return {
        success: false,
        error: "This reset link is invalid or has expired. Please request a new one.",
      };
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
    user.password = hashedPassword;
    await user.save();

    resetRecord.usedAt = new Date();
    await resetRecord.save();

    await PasswordResetToken.deleteMany({
      userId: user._id,
      _id: { $ne: resetRecord._id },
    });

    return {
      success: true,
      message: "Your password has been updated. You can now sign in with your new password.",
    };
  } catch (error: unknown) {
    console.error("resetPasswordWithToken error:", error);
    return { success: false, error: "Something went wrong. Please try again later." };
  }
}
