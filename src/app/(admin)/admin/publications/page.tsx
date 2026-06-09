"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
import Loader from "@/components/ui/Loader";
import Modal from "@/components/ui/Modal";
import { getProjects, createProject, updateProject, deleteProject } from "@/actions/cms.actions";

interface PublicationProject {
  _id: string;
  title: string;
  description: string;
  authors: string;
  journal?: string;
  link?: string;
  year: number;
  image?: string;
  featured?: boolean;
}

export default function PublicationsPage() {
  const [projects, setProjects] = useState<PublicationProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [authors, setAuthors] = useState("");
  const [journal, setJournal] = useState("");
  const [link, setLink] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [image, setImage] = useState("");
  const [featured, setFeatured] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Load all publications
  useEffect(() => {
    async function loadData() {
      try {
        const res = await getProjects();
        if (res.success && res.data) {
          setProjects(res.data);
        } else {
          showToast(res.error || "Failed to load publications", "error");
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
    setAuthors("");
    setJournal("");
    setLink("");
    setYear(new Date().getFullYear());
    setImage("");
    setFeatured(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proj: PublicationProject) => {
    setEditingId(proj._id);
    setTitle(proj.title);
    setDescription(proj.description);
    setAuthors(proj.authors);
    setJournal(proj.journal || "");
    setLink(proj.link || "");
    setYear(proj.year);
    setImage(proj.image || "");
    setFeatured(!!proj.featured);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this publication?")) return;

    try {
      const res = await deleteProject(id);
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p._id !== id));
        showToast("Publication removed successfully!", "success");
      } else {
        showToast(res.error || "Failed to delete publication", "error");
      }
    } catch (err) {
      showToast("Something went wrong", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !authors || !year) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        title,
        description,
        authors,
        journal: journal || undefined,
        link: link || undefined,
        year,
        image: image || undefined,
        featured,
      };

      if (editingId) {
        const res = await updateProject(editingId, payload);
        if (res.success && res.data) {
          setProjects((prev) => prev.map((p) => (p._id === editingId ? res.data : p)));
          showToast("Publication updated successfully", "success");
          setIsModalOpen(false);
        } else {
          showToast(res.error || "Failed to update publication", "error");
        }
      } else {
        const res = await createProject(payload);
        if (res.success && res.data) {
          setProjects((prev) => [res.data, ...prev]);
          showToast("Publication added successfully", "success");
          setIsModalOpen(false);
        } else {
          showToast(res.error || "Failed to add publication", "error");
        }
      }
    } catch (err) {
      showToast("Error processing request", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Loader size="lg" />
      </div>
    );
  }

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
            Publications & Research Showcase
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Manage the list of books, journals, whitepapers, and international research works.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>+ Add Publication</Button>
      </div>

      {projects.length === 0 ? (
        <Card style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "1.125rem" }}>No publications added yet.</p>
          <Button onClick={handleOpenCreate} style={{ marginTop: "1rem" }}>
            Add Your First Publication
          </Button>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>
          {projects.map((proj) => (
            <Card key={proj._id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "1.5rem" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                    <Badge variant="primary">{proj.year}</Badge>
                    {proj.featured && <Badge variant="success">Featured</Badge>}
                    {proj.journal && <span style={{ color: "var(--color-accent)", fontSize: "0.875rem", fontWeight: "500" }}>{proj.journal}</span>}
                  </div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
                    {proj.title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", fontStyle: "italic", marginBottom: "0.75rem" }}>
                    Authors: {proj.authors}
                  </p>
                  <p style={{ fontSize: "0.95rem", color: "var(--color-text-secondary)" }}>
                    {proj.description}
                  </p>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        marginTop: "0.75rem",
                        color: "var(--color-primary)",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        textDecoration: "underline",
                      }}
                    >
                      View Source Publication Link
                    </a>
                  )}
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column", minWidth: "100px" }}>
                  <Button size="sm" variant="outline" onClick={() => handleOpenEdit(proj)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(proj._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          title={editingId ? "Edit Publication / Project" : "Add New Publication / Project"}
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%", maxWidth: "550px" }}>
            <Input
              label="Publication / Project Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Advanced Deep Learning Paradigms in Smart Grids"
              required
            />

            <Input
              label="Authors (Comma separated) *"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder="e.g. Dr. Jane Smith, Prof. John Doe"
              required
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Input
                label="Publisher / Journal"
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                placeholder="e.g. IEEE Transactions"
              />

              <Input
                label="Publishing Year *"
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-secondary)" }}>
                Abstract / Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief summary of the research methodology and key findings."
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
              label="Link to Publication / Full-Text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://doi.org/... or https://ieee.org/..."
            />

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label htmlFor="featured" style={{ fontSize: "0.875rem", cursor: "pointer" }}>
                  Feature this publication on homepage
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", borderTop: "1px solid var(--color-border)", paddingTop: "1rem", marginTop: "1rem" }}>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={actionLoading}>
                {editingId ? "Save Changes" : "Create Publication"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
