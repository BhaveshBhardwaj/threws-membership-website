import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Application from "@/models/Application";
import Member from "@/models/Member";
import BlogPost from "@/models/BlogPost";
import NewsletterSubscriber from "@/models/NewsletterSubscriber";
import DashboardClient from "./DashboardClient";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  await dbConnect();

  // Run Mongoose aggregates and counts concurrently
  const [
    totalApps,
    unreadApps,
    activeMembers,
    blogPosts,
    subscribers,
    failedEmailsCount,
    fellowApps,
    honoraryApps,
    distinguishedApps,
    deliveredEmails,
    failedEmailsStatusCount,
    recentAppsRaw,
  ] = await Promise.all([
    Application.countDocuments(),
    Application.countDocuments({ status: "submitted", isAdminRead: false }),
    Member.countDocuments({ status: "active" }),
    BlogPost.countDocuments(),
    NewsletterSubscriber.countDocuments({ isActive: true }),
    Application.countDocuments({ emailDeliveryStatus: "failed" }),
    Application.countDocuments({ type: "fellow" }),
    Application.countDocuments({ type: "professional" }),
    Application.countDocuments({ type: "distinguished_fellow" }),
    Application.countDocuments({ emailDeliveryStatus: "success" }),
    Application.countDocuments({ emailDeliveryStatus: "failed" }),
    Application.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  const stats = {
    totalApps,
    unreadApps,
    activeMembers,
    blogPosts,
    subscribers,
    failedEmails: failedEmailsCount,
  };

  const chartData = {
    fellowApps,
    honoraryApps,
    distinguishedApps,
    deliveredEmails,
    failedEmails: failedEmailsStatusCount,
  };

  const recentApplications = recentAppsRaw.map((app: any) => ({
    _id: app._id.toString(),
    fullName: app.fullName,
    email: app.email,
    type: app.type,
    status: app.status,
    emailDeliveryStatus: app.emailDeliveryStatus || "pending",
    emailDeliveryError: app.emailDeliveryError,
    createdAt: app.createdAt instanceof Date ? app.createdAt.toISOString() : String(app.createdAt),
    isAdminRead: !!app.isAdminRead,
  }));

  return (
    <div>
      <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "2rem", color: "var(--color-text-primary)" }}>
        Dashboard Overview
      </h1>
      
      <DashboardClient
        initialUnreadCount={unreadApps}
        recentApplications={recentApplications}
        stats={stats}
        chartData={chartData}
      />
    </div>
  );
}

