import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;

// Re-export the handlers NextAuth creates so App Router picks them up
// as the /api/auth/* catch-all route.

