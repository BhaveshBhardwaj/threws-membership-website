"use server";

import { contactFormSchema } from "@/lib/validations";
import { sendContactNotification, sendContactAcknowledgementEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { headers } from "next/headers";
import type { ApiResponse, ContactFormData } from "@/types";

/* ────────── Public: Submit Contact Form ────────────────────────────── */

export async function submitContactForm(
  data: ContactFormData
): Promise<ApiResponse> {
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
    const parsed = contactFormSchema.safeParse(data);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Validation failed",
      };
    }

    // Notify admin and send acknowledgement to the submitter
    await sendContactNotification(parsed.data);
    try {
      await sendContactAcknowledgementEmail(parsed.data);
    } catch (ackErr) {
      console.error("Failed to send contact acknowledgement email:", ackErr);
    }

    return {
      success: true,
      message: "Thank you for reaching out! We will get back to you soon.",
    };
  } catch (error) {
    console.error("submitContactForm error:", error);
    return {
      success: false,
      error: "Failed to send your message. Please try again later.",
    };
  }
}
