"use server";

import dbConnect from "@/lib/db";
import NewsletterSubscriber from "@/models/NewsletterSubscriber";
import { auth } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { headers } from "next/headers";
import type { ApiResponse } from "@/types";

/* ────────── Public: Subscribe to Newsletter ────────────────────────── */

export async function subscribeToNewsletter(
  email: string
): Promise<ApiResponse> {
  try {
    // 1. Rate Limit
    const headersList = await headers();
    const ip = getClientIp(headersList);
    const limit = rateLimit(ip, "form");

    if (!limit.success) {
      return {
        success: false,
        error: `Too many attempts. Please wait ${Math.ceil(limit.resetMs / 1000)} seconds.`,
      };
    }

    // 2. Simple email format validation
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      return { success: false, error: "Please enter a valid email address" };
    }

    await dbConnect();

    // 3. Check if already subscribed
    const existing = await NewsletterSubscriber.findOne({ email: trimmedEmail });
    if (existing) {
      if (existing.isActive) {
        return {
          success: true,
          message: "You are already subscribed to our newsletter!",
        };
      } else {
        // Re-activate subscription
        existing.isActive = true;
        existing.subscribedAt = new Date();
        await existing.save();
        return {
          success: true,
          message: "Welcome back! Your subscription is re-activated successfully.",
        };
      }
    }

    // 4. Create new subscriber
    await NewsletterSubscriber.create({
      email: trimmedEmail,
      isActive: true,
    });

    return {
      success: true,
      message: "Thank you for subscribing to our research newsletter!",
    };
  } catch (error) {
    console.error("subscribeToNewsletter error:", error);
    return {
      success: false,
      error: "Subscription failed. Please try again later.",
    };
  }
}

/* ────────── Admin: List All Subscribers ────────────────────────────── */

export async function getNewsletterSubscribers(): Promise<
  ApiResponse<any[]>
> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    const subscribers = await NewsletterSubscriber.find()
      .sort({ subscribedAt: -1 })
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(subscribers)),
    };
  } catch (error) {
    console.error("getNewsletterSubscribers error:", error);
    return { success: false, error: "Failed to fetch newsletter subscribers" };
  }
}

/* ────────── Admin: Toggle Active State / Unsubscribe ───────────────── */

export async function toggleNewsletterSubscription(
  id: string,
  isActive: boolean
): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    const subscriber = await NewsletterSubscriber.findByIdAndUpdate(
      id,
      { isActive },
      { returnDocument: "after" }
    );

    if (!subscriber) {
      return { success: false, error: "Subscriber not found" };
    }

    return {
      success: true,
      message: isActive
        ? "Subscription activated successfully"
        : "Subscriber unsubscribed successfully",
    };
  } catch (error) {
    console.error("toggleNewsletterSubscription error:", error);
    return { success: false, error: "Failed to update subscriber status" };
  }
}
