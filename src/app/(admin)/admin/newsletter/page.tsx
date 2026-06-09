"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
import Loader from "@/components/ui/Loader";
import Table from "@/components/ui/Table";
import { getNewsletterSubscribers, toggleNewsletterSubscription } from "@/actions/newsletter.actions";

interface Subscriber {
  _id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
}

export default function NewsletterSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getNewsletterSubscribers();
        if (res.success && res.data) {
          setSubscribers(res.data);
        } else {
          showToast(res.error || "Failed to load newsletter subscribers", "error");
        }
      } catch (err) {
        showToast("Error retrieving subscribers", "error");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      setUpdatingId(id);
      const nextActiveState = !currentActive;
      const res = await toggleNewsletterSubscription(id, nextActiveState);
      
      if (res.success) {
        setSubscribers((prev) =>
          prev.map((sub) => (sub._id === id ? { ...sub, isActive: nextActiveState } : sub))
        );
        showToast(
          nextActiveState
            ? "Subscriber activated successfully"
            : "Subscriber unsubscribed successfully",
          "success"
        );
      } else {
        showToast(res.error || "Failed to update subscriber status", "error");
      }
    } catch (err) {
      showToast("Something went wrong", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCSV = () => {
    if (subscribers.length === 0) return;
    
    // Convert to CSV string
    const headers = "Email,Status,SubscribedAt\n";
    const rows = subscribers
      .map((sub) => `"${sub.email}",${sub.isActive ? "Active" : "Unsubscribed"},"${new Date(sub.subscribedAt).toLocaleString()}"`)
      .join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `westbridge_newsletter_subscribers_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Loader size="lg" />
      </div>
    );
  }

  // Header mappings for the Table component
  const columns = [
    { header: "Email Address", key: "email" },
    { header: "Subscription Date", key: "subscribedAt" },
    { header: "Status", key: "status" },
    { header: "Actions", key: "actions" }
  ];

  const tableData = subscribers.map((sub) => ({
    email: <span style={{ fontWeight: "500" }}>{sub.email}</span>,
    subscribedAt: new Date(sub.subscribedAt).toLocaleString(),
    status: (
      <Badge variant={sub.isActive ? "success" : "default"}>
        {sub.isActive ? "Subscribed" : "Unsubscribed"}
      </Badge>
    ),
    actions: (
      <Button
        size="sm"
        variant={sub.isActive ? "danger" : "primary"}
        disabled={updatingId === sub._id}
        onClick={() => handleToggleActive(sub._id, sub.isActive)}
      >
        {updatingId === sub._id ? "..." : sub.isActive ? "Unsubscribe" : "Re-activate"}
      </Button>
    )
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "var(--color-text-primary)" }}>
            Newsletter Subscribers Workspace
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Monitor public subscriber signups, export email lists for campaigns, or manually manage subscriber access.
          </p>
        </div>
        
        {subscribers.length > 0 && (
          <Button onClick={exportCSV} variant="outline">
            📥 Export Email List (CSV)
          </Button>
        )}
      </div>

      <Card>
        {subscribers.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
            No newsletter subscribers registered yet.
          </div>
        ) : (
          <Table columns={columns} data={tableData} />
        )}
      </Card>
    </div>
  );
}
