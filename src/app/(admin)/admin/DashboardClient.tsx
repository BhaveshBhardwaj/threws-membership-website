"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { markApplicationAsRead, retryApplicationEmail, getUnreadApplicationsCount } from "@/actions/application.actions";

interface ApplicationFeedItem {
  _id: string;
  fullName: string;
  email: string;
  type: "student" | "collaborator" | "professional" | "senior" | "fellow" | "distinguished_fellow";
  status: "draft" | "submitted" | "under_review" | "interview" | "approved" | "rejected";
  emailDeliveryStatus: "pending" | "success" | "failed";
  emailDeliveryError?: string;
  createdAt: string;
  isAdminRead: boolean;
}

const APPLICATION_TYPE_LABELS: Record<ApplicationFeedItem["type"], string> = {
  student: "Student Researcher",
  collaborator: "Collaborator",
  professional: "Professional Member",
  senior: "Senior Member",
  fellow: "Fellow (F.Res)",
  distinguished_fellow: "Honorary Fellow",
};

interface DashboardClientProps {
  initialUnreadCount: number;
  recentApplications: ApplicationFeedItem[];
  stats: {
    totalApps: number;
    unreadApps: number;
    activeMembers: number;
    blogPosts: number;
    subscribers: number;
    failedEmails: number;
  };
  chartData: {
    fellowApps: number;
    honoraryApps: number;
    distinguishedApps: number;
    deliveredEmails: number;
    failedEmails: number;
  };
}

export default function DashboardClient({
  initialUnreadCount,
  recentApplications,
  stats,
  chartData,
}: DashboardClientProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [apps, setApps] = useState<ApplicationFeedItem[]>(recentApplications);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-refresh unread count every 30 seconds
  const refreshUnreadCount = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await getUnreadApplicationsCount();
      if (res.success && typeof res.data === 'number') {
        setUnreadCount(res.data);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to refresh unread count:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshIntervalRef.current = setInterval(() => {
      refreshUnreadCount();
    }, 30000);
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [refreshUnreadCount]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      setLoadingActionId(id);
      const res = await markApplicationAsRead(id);
      if (res.success) {
        setApps((prev) =>
          prev.map((app) => (app._id === id ? { ...app, isAdminRead: true } : app))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        showToast("Application marked as read", "success");
      } else {
        showToast(res.error || "Failed to update application", "error");
      }
    } catch (err) {
      showToast("Something went wrong", "error");
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleRetryEmail = async (id: string) => {
    try {
      setLoadingActionId(`email-${id}`);
      const res = await retryApplicationEmail(id);
      if (res.success) {
        setApps((prev) =>
          prev.map((app) => (app._id === id ? { ...app, emailDeliveryStatus: "success", emailDeliveryError: undefined } : app))
        );
        showToast("Notification email resent successfully!", "success");
      } else {
        showToast(res.error || "Failed to resend email", "error");
      }
    } catch (err) {
      showToast("Something went wrong", "error");
    } finally {
      setLoadingActionId(null);
    }
  };

  // SVG Chart Computations
  const totalCategoryApps =
    chartData.fellowApps + chartData.honoraryApps + chartData.distinguishedApps || 1;
  const fellowPercent = Math.round((chartData.fellowApps / totalCategoryApps) * 100);
  const honoraryPercent = Math.round((chartData.honoraryApps / totalCategoryApps) * 100);
  const distinguishedPercent = Math.round((chartData.distinguishedApps / totalCategoryApps) * 100);

  const totalEmailLogged = chartData.deliveredEmails + chartData.failedEmails || 1;
  const successEmailPercent = Math.round((chartData.deliveredEmails / totalEmailLogged) * 100);

  // Circular progress stroke dash offsets
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (successEmailPercent / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Live status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite', display: 'inline-block' }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            Live Dashboard • Last updated: {lastRefreshed.toLocaleTimeString()} • Auto-refreshes every 30s
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={refreshUnreadCount}
          loading={refreshing}
        >
          ↻ Refresh Now
        </Button>
      </div>

      {/* Dynamic Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "1.5rem",
        }}
      >
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: "1rem", color: "var(--color-text-secondary)", fontWeight: "500" }}>
              Total Applications
            </h3>
            <Badge variant="primary">Platform</Badge>
          </div>
          <p style={{ fontSize: "2.5rem", fontWeight: "700", marginTop: "0.75rem", color: "var(--color-text-primary)" }}>
            {stats.totalApps}
          </p>
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: "1rem", color: "var(--color-text-secondary)", fontWeight: "500" }}>
              New Unread Inbox
            </h3>
            {unreadCount > 0 ? (
              <Badge variant="warning">{unreadCount} New</Badge>
            ) : (
              <Badge variant="success">All Read</Badge>
            )}
          </div>
          <p style={{ fontSize: "2.5rem", fontWeight: "700", marginTop: "0.75rem", color: "var(--color-text-primary)" }}>
            {unreadCount}
          </p>
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: "1rem", color: "var(--color-text-secondary)", fontWeight: "500" }}>
              Active Members
            </h3>
            <Badge variant="success">Hall & List</Badge>
          </div>
          <p style={{ fontSize: "2.5rem", fontWeight: "700", marginTop: "0.75rem", color: "var(--color-text-primary)" }}>
            {stats.activeMembers}
          </p>
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: "1rem", color: "var(--color-text-secondary)", fontWeight: "500" }}>
              Research Articles
            </h3>
            <Badge variant="default">Blogs</Badge>
          </div>
          <p style={{ fontSize: "2.5rem", fontWeight: "700", marginTop: "0.75rem", color: "var(--color-text-primary)" }}>
            {stats.blogPosts}
          </p>
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: "1rem", color: "var(--color-text-secondary)", fontWeight: "500" }}>
              Newsletter List
            </h3>
            <Badge variant="default">Subscribers</Badge>
          </div>
          <p style={{ fontSize: "2.5rem", fontWeight: "700", marginTop: "0.75rem", color: "var(--color-text-primary)" }}>
            {stats.subscribers}
          </p>
        </Card>
      </div>

      {/* SVG Analytics Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "2rem",
        }}
      >
        <Card>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1.5rem", color: "var(--color-text-primary)" }}>
            Application Division Distribution
          </h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", gap: "2rem", height: "180px" }}>
            {/* Visual HTML/CSS horizontal comparison chart */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                  <span style={{ fontWeight: "500" }}>Fellow Member</span>
                  <span>{chartData.fellowApps} ({fellowPercent}%)</span>
                </div>
                <div style={{ height: "12px", background: "var(--color-bg-tertiary)", borderRadius: "6px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${fellowPercent}%`,
                      background: "linear-gradient(90deg, #3b82f6, #1d4ed8)",
                      borderRadius: "6px",
                      transition: "width 1s ease-out",
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                  <span style={{ fontWeight: "500" }}>Honorary Fellow</span>
                  <span>{chartData.honoraryApps} ({honoraryPercent}%)</span>
                </div>
                <div style={{ height: "12px", background: "var(--color-bg-tertiary)", borderRadius: "6px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${honoraryPercent}%`,
                      background: "linear-gradient(90deg, #10b981, #047857)",
                      borderRadius: "6px",
                      transition: "width 1s ease-out",
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                  <span style={{ fontWeight: "500" }}>Distinguished Fellow</span>
                  <span>{chartData.distinguishedApps} ({distinguishedPercent}%)</span>
                </div>
                <div style={{ height: "12px", background: "var(--color-bg-tertiary)", borderRadius: "6px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${distinguishedPercent}%`,
                      background: "linear-gradient(90deg, #d4af37, #aa7c11)",
                      borderRadius: "6px",
                      transition: "width 1s ease-out",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1.5rem", color: "var(--color-text-primary)" }}>
            Nodemailer SMTP Dispatch Success Rate
          </h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", gap: "2rem", height: "180px" }}>
            <div style={{ position: "relative", width: "120px", height: "120px" }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="var(--color-bg-tertiary)"
                  strokeWidth="12"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke={stats.failedEmails > 0 ? "var(--color-error)" : "var(--color-success)"}
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "1.25rem", fontWeight: "700", margin: 0 }}>
                  {successEmailPercent}%
                </p>
                <p style={{ fontSize: "0.625rem", color: "var(--color-text-secondary)", margin: 0 }}>
                  Success
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ display: "inline-block", width: "10px", height: "10px", background: "var(--color-success)", borderRadius: "50%" }} />
                <span>Delivered: {chartData.deliveredEmails}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ display: "inline-block", width: "10px", height: "10px", background: "var(--color-error)", borderRadius: "50%" }} />
                <span style={{ color: stats.failedEmails > 0 ? "var(--color-error)" : "inherit", fontWeight: stats.failedEmails > 0 ? "600" : "normal" }}>
                  SMTP Failed: {chartData.failedEmails}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Live Inbox / Notifications Feed */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--color-text-primary)" }}>
              Recent Applications & Dispatch Feed
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
              Real-time audit log of submissions, read notifications, and SMTP deliverability logs.
            </p>
          </div>
          <Badge variant="default">{apps.length} Total Feed</Badge>
        </div>

        {apps.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-secondary)" }}>
            No recent applications found.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {apps.map((app) => (
              <div
                key={app._id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem 1.25rem",
                  borderRadius: "8px",
                  background: app.isAdminRead ? "var(--color-bg-secondary)" : "var(--color-primary-50)",
                  border: `1px solid ${app.isAdminRead ? "var(--color-border)" : "var(--color-primary-100)"}`,
                  transition: "all 0.2s ease",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flex: 1, minWidth: "250px" }}>
                  <div style={{ marginTop: "0.25rem" }}>
                    {!app.isAdminRead && (
                      <span
                        style={{
                          display: "inline-block",
                          width: "8px",
                          height: "8px",
                          background: "var(--color-warning)",
                          borderRadius: "50%",
                          marginRight: "8px",
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <p style={{ fontWeight: "600", fontSize: "1rem", color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {app.fullName}
                      <span style={{ fontSize: "0.75rem", fontWeight: "normal", color: "var(--color-text-secondary)" }}>
                        ({app.email})
                      </span>
                    </p>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
                      Applied for: <strong>{APPLICATION_TYPE_LABELS[app.type]}</strong> on {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                    {/* SMTP logs indicator */}
                    <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        SMTP status:
                        {app.emailDeliveryStatus === "success" && (
                          <Badge variant="success">Delivered</Badge>
                        )}
                        {app.emailDeliveryStatus === "pending" && (
                          <Badge variant="warning">In Queue</Badge>
                        )}
                        {app.emailDeliveryStatus === "failed" && (
                          <Badge variant="error">Delivery Failed</Badge>
                        )}
                      </span>
                      {app.emailDeliveryError && (
                        <span style={{ fontSize: "0.75rem", color: "var(--color-error)", fontStyle: "italic" }}>
                          Error: {app.emailDeliveryError}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  {!app.isAdminRead && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loadingActionId === app._id}
                      onClick={() => handleMarkAsRead(app._id)}
                    >
                      {loadingActionId === app._id ? "..." : "Mark Read"}
                    </Button>
                  )}

                  {app.emailDeliveryStatus === "failed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loadingActionId === `email-${app._id}`}
                      onClick={() => handleRetryEmail(app._id)}
                    >
                      {loadingActionId === `email-${app._id}` ? "..." : "Retry Email"}
                    </Button>
                  )}

                  <a href={`/admin/applications`}>
                    <Button size="sm" variant="secondary">
                      Manage Page
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
