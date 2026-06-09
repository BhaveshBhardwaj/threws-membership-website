"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
import Loader from "@/components/ui/Loader";
import Modal from "@/components/ui/Modal";
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from "@/actions/cms.actions";

interface SpotlightEntry {
  _id: string;
  name: string;
  designation: string;
  institution: string;
  text: string;
  photoUrl?: string;
  type: "testimonial" | "highlight" | "spotlight";
  featured?: boolean;
}

export default function TestimonialsPage() {
  const [spotlights, setSpotlights] = useState<SpotlightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [institution, setInstitution] = useState("");
  const [text, setText] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [type, setType] = useState<"testimonial" | "highlight" | "spotlight">("testimonial");
  const [featured, setFeatured] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Load testimonials
  useEffect(() => {
    async function loadData() {
      try {
        const res = await getTestimonials();
        if (res.success && res.data) {
          setSpotlights(res.data);
        } else {
          showToast(res.error || "Failed to load spotlights", "error");
        }
      } catch (err) {
        showToast("Error retrieving testimonials", "error");
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
    setName("");
    setDesignation("");
    setInstitution("");
    setText("");
    setPhotoUrl("");
    setType("testimonial");
    setFeatured(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entry: SpotlightEntry) => {
    setEditingId(entry._id);
    setName(entry.name);
    setDesignation(entry.designation);
    setInstitution(entry.institution);
    setText(entry.text);
    setPhotoUrl(entry.photoUrl || "");
    setType(entry.type);
    setFeatured(!!entry.featured);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this spotlight/testimonial?")) return;

    try {
      const res = await deleteTestimonial(id);
      if (res.success) {
        setSpotlights((prev) => prev.filter((s) => s._id !== id));
        showToast("Spotlight deleted successfully!", "success");
      } else {
        showToast(res.error || "Failed to delete item", "error");
      }
    } catch (err) {
      showToast("Something went wrong", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !designation || !institution || !text) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        name,
        designation,
        institution,
        text,
        photoUrl: photoUrl || undefined,
        type,
        featured,
      };

      if (editingId) {
        const res = await updateTestimonial(editingId, payload);
        if (res.success && res.data) {
          setSpotlights((prev) => prev.map((s) => (s._id === editingId ? res.data : s)));
          showToast("Spotlight updated successfully!", "success");
          setIsModalOpen(false);
        } else {
          showToast(res.error || "Failed to update spotlight", "error");
        }
      } else {
        const res = await createTestimonial(payload);
        if (res.success && res.data) {
          setSpotlights((prev) => [res.data, ...prev]);
          showToast("Spotlight created successfully!", "success");
          setIsModalOpen(false);
        } else {
          showToast(res.error || "Failed to add spotlight", "error");
        }
      }
    } catch (err) {
      showToast("Error processing request", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSpotlights = activeTab === "all" ? spotlights : spotlights.filter((s) => s.type === activeTab);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Loader size="lg" />
      </div>
    );
  }

  const tabList = [
    { key: "all", label: "All Testimonials & Highlights" },
    { key: "testimonial", label: "Client Testimonials" },
    { key: "highlight", label: "Member Highlights" },
    { key: "spotlight", label: "Researcher Spotlights" },
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
            Testimonials & Spotlight Management
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Add, edit, and curate member feedback, professional achievements, and research spotlights on the public page.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>+ Add Spotlight/Feedback</Button>
      </div>

      {/* Tab Filter Bar */}
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

      {filteredSpotlights.length === 0 ? (
        <Card style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "1.125rem" }}>No entries found for this category.</p>
          <Button onClick={handleOpenCreate} style={{ marginTop: "1rem" }}>
            Create New Spotlight Entry
          </Button>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {filteredSpotlights.map((entry) => (
            <Card key={entry._id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <Badge variant="primary">{entry.type.toUpperCase()}</Badge>
                    {entry.featured && <Badge variant="success">Featured</Badge>}
                  </div>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <Button size="sm" variant="outline" onClick={() => handleOpenEdit(entry)} style={{ padding: "0.25rem 0.5rem" }}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(entry._id)} style={{ padding: "0.25rem 0.5rem" }}>
                      Delete
                    </Button>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
                  {entry.photoUrl ? (
                    <img
                      src={entry.photoUrl}
                      alt={entry.name}
                      style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--color-primary-100)" }}
                    />
                  ) : (
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--color-primary-100)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                      {entry.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 style={{ fontWeight: "600", fontSize: "1.05rem", margin: 0 }}>{entry.name}</h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", margin: "0.15rem 0 0" }}>
                      {entry.designation}, <strong>{entry.institution}</strong>
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", fontStyle: "italic", lineHeight: "1.6" }}>
                  &ldquo;{entry.text}&rdquo;
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          title={editingId ? "Edit Spotlight / Testimonial" : "Create Spotlight / Testimonial"}
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%", maxWidth: "550px" }}>
            <Input
              label="Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Jane Smith"
              required
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Input
                label="Designation / Title *"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Senior Researcher"
                required
              />

              <Input
                label="Institution / Affiliation *"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Westbridge Organization"
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-secondary)" }}>
                  Entry Category Type *
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
                  <option value="testimonial">Client Testimonial</option>
                  <option value="highlight">Member Highlight</option>
                  <option value="spotlight">Researcher Spotlight</option>
                </select>
              </div>

              <Input
                label="Avatar/Photo URL"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="e.g. /uploads/avatar.png"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-secondary)" }}>
                Feedback / Content Quote Text *
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write the highlight abstract or researcher testimonial here."
                rows={4}
                required
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

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                id="featuredSpotlight"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <label htmlFor="featuredSpotlight" style={{ fontSize: "0.875rem", cursor: "pointer" }}>
                Feature on homepage testimonial slider
              </label>
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", borderTop: "1px solid var(--color-border)", paddingTop: "1rem", marginTop: "1rem" }}>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={actionLoading}>
                {editingId ? "Save Changes" : "Create Spotlight"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
