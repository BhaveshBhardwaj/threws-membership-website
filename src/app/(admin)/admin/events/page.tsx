"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
import Loader from "@/components/ui/Loader";
import Modal from "@/components/ui/Modal";
import { getEvents, createEvent, updateEvent, deleteEvent } from "@/actions/cms.actions";

interface OrgEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  type: "event" | "announcement" | "milestone" | "achievement" | "collaboration";
  image?: string;
  link?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<"event" | "announcement" | "milestone" | "achievement" | "collaboration">("event");
  const [image, setImage] = useState("");
  const [link, setLink] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Load all events
  useEffect(() => {
    async function loadData() {
      try {
        const res = await getEvents();
        if (res.success && res.data) {
          setEvents(res.data);
        } else {
          showToast(res.error || "Failed to load events", "error");
        }
      } catch (err) {
        showToast("Error retrieving data", "error");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setLocation("");
    setType("event");
    setImage("");
    setLink("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evt: OrgEvent) => {
    setEditingId(evt._id);
    setTitle(evt.title);
    setDescription(evt.description);
    // Format date string to YYYY-MM-DD
    const formattedDate = evt.date ? new Date(evt.date).toISOString().split("T")[0] : "";
    setDate(formattedDate);
    setLocation(evt.location || "");
    setType(evt.type);
    setImage(evt.image || "");
    setLink(evt.link || "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const res = await deleteEvent(id);
      if (res.success) {
        setEvents((prev) => prev.filter((e) => e._id !== id));
        showToast("Entry removed successfully!", "success");
      } else {
        showToast(res.error || "Failed to delete entry", "error");
      }
    } catch (err) {
      showToast("Something went wrong", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !type) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        title,
        description,
        date,
        location: location || undefined,
        type,
        image: image || undefined,
        link: link || undefined,
      };

      if (editingId) {
        const res = await updateEvent(editingId, payload);
        if (res.success && res.data) {
          setEvents((prev) => prev.map((e) => (e._id === editingId ? res.data : e)));
          showToast("Entry updated successfully", "success");
          setIsModalOpen(false);
        } else {
          showToast(res.error || "Failed to update entry", "error");
        }
      } else {
        const res = await createEvent(payload);
        if (res.success && res.data) {
          setEvents((prev) => [res.data, ...prev]);
          showToast("Entry added successfully", "success");
          setIsModalOpen(false);
        } else {
          showToast(res.error || "Failed to add entry", "error");
        }
      }
    } catch (err) {
      showToast("Error processing request", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredEvents = activeTab === "all" ? events : events.filter((e) => e.type === activeTab);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Loader size="lg" />
      </div>
    );
  }

  const tabList = [
    { key: "all", label: "All Timeline Entries" },
    { key: "event", label: "Events" },
    { key: "announcement", label: "Announcements" },
    { key: "milestone", label: "Milestones" },
    { key: "achievement", label: "Achievements" },
    { key: "collaboration", label: "Collaborations" },
  ];

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
            Events, Announcements & Achievements
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Add, update, or remove dynamic events, corporate announcements, scientific milestones, and global collaborations.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>+ Add Timeline Entry</Button>
      </div>

      {/* Tabs Filter Bar */}
      <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem", borderBottom: "1px solid var(--color-border)" }}>
        {tabList.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              border: "none",
              fontSize: "0.875rem",
              fontWeight: activeTab === t.key ? "600" : "500",
              background: activeTab === t.key ? "var(--color-primary-50)" : "transparent",
              color: activeTab === t.key ? "var(--color-primary)" : "var(--color-text-secondary)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <Card style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "1.125rem" }}>No timeline entries found for this category.</p>
          <Button onClick={handleOpenCreate} style={{ marginTop: "1rem" }}>
            Create New Entry
          </Button>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>
          {filteredEvents.map((evt) => (
            <Card key={evt._id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "1.5rem" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                    <Badge variant="primary">{evt.type.toUpperCase()}</Badge>
                    <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                      {new Date(evt.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    {evt.location && (
                      <span style={{ fontSize: "0.875rem", color: "var(--color-accent)", fontWeight: "500" }}>
                        📍 {evt.location}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                    {evt.title}
                  </h3>
                  <p style={{ fontSize: "0.95rem", color: "var(--color-text-secondary)", lineHeight: "1.5" }}>
                    {evt.description}
                  </p>
                  {evt.link && (
                    <a
                      href={evt.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        marginTop: "0.75rem",
                        color: "var(--color-primary)",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                      }}
                    >
                      Learn More &rarr;
                    </a>
                  )}
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column", minWidth: "100px" }}>
                  <Button size="sm" variant="outline" onClick={() => handleOpenEdit(evt)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(evt._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          title={editingId ? "Edit Timeline Entry" : "Create New Timeline Entry"}
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%", maxWidth: "550px" }}>
            <Input
              label="Entry Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Westbridge Collaborates with Global Research Network"
              required
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-secondary)" }}>
                  Entry Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-bg-primary)",
                    fontSize: "0.875rem",
                  }}
                >
                  <option value="event">Event</option>
                  <option value="announcement">Announcement</option>
                  <option value="milestone">Milestone</option>
                  <option value="achievement">Achievement</option>
                  <option value="collaboration">Collaboration</option>
                </select>
              </div>

              <Input
                label="Date *"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Input
                label="Location (optional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. New Delhi, India / Online"
              />

              <Input
                label="Featured Image Link"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/images/... or upload URL"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-secondary)" }}>
                Description / Body Content
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Full details or copy text for this timeline entry."
                rows={4}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  border: "1px solid var(--color-border)",
                  fontFamily: "inherit",
                  fontSize: "0.875rem",
                }}
              />
            </div>

            <Input
              label="Hyperlink (Learn More Link)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com/press-release"
            />

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", borderTop: "1px solid var(--color-border)", paddingTop: "1rem", marginTop: "1rem" }}>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={actionLoading}>
                {editingId ? "Save Changes" : "Create Entry"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
