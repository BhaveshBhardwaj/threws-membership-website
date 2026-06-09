"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
import Loader from "@/components/ui/Loader";
import { getCMSSections, updateCMSSection } from "@/actions/cms.actions";

interface CMSSectionData {
  key: string;
  title: string;
  subtitle?: string;
  content?: string;
  image?: string;
  order: number;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export default function CMSPage() {
  const [sections, setSections] = useState<CMSSectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [metaCounters, setMetaCounters] = useState<{ label: string; value: string }[]>([]);

  // Fetch sections
  useEffect(() => {
    async function loadSections() {
      try {
        const res = await getCMSSections();
        if (res.success && res.data) {
          setSections(res.data);
          if (res.data.length > 0) {
            selectSection(res.data[0]);
          }
        } else {
          showToast(res.error || "Failed to load sections", "error");
        }
      } catch (err) {
        showToast("Error fetching CMS data", "error");
      } finally {
        setLoading(false);
      }
    }
    loadSections();
  }, []);

  const selectSection = (sec: CMSSectionData) => {
    setSelectedKey(sec.key);
    setTitle(sec.title);
    setSubtitle(sec.subtitle || "");
    setContent(sec.content || "");
    setImage(sec.image || "");
    setOrder(sec.order);
    setIsActive(sec.isActive);
    
    // Parse metadata counters if exist
    if (sec.metadata && sec.metadata.counters) {
      setMetaCounters(sec.metadata.counters);
    } else {
      setMetaCounters([]);
    }
  };

  const handleSelectChange = (key: string) => {
    const sec = sections.find((s) => s.key === key);
    if (sec) {
      selectSection(sec);
    }
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKey) return;

    try {
      setSavingKey(selectedKey);
      
      const payload: any = {
        title,
        subtitle: subtitle || undefined,
        content: content || undefined,
        image: image || undefined,
        order,
        isActive,
      };

      if (metaCounters.length > 0) {
        payload.metadata = { counters: metaCounters };
      }

      const res = await updateCMSSection(selectedKey, payload);

      if (res.success && res.data) {
        showToast(`Homepage section "${selectedKey.toUpperCase()}" updated successfully!`, "success");
        // Update local state list
        setSections((prev) =>
          prev.map((sec) => (sec.key === selectedKey ? { ...sec, ...res.data } : sec))
        );
      } else {
        showToast(res.error || "Failed to save section settings", "error");
      }
    } catch (err) {
      showToast("An error occurred while saving", "error");
    } finally {
      setSavingKey(null);
    }
  };

  const addCounterField = () => {
    setMetaCounters((prev) => [...prev, { label: "", value: "" }]);
  };

  const removeCounterField = (index: number) => {
    setMetaCounters((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCounterChange = (index: number, field: "label" | "value", val: string) => {
    setMetaCounters((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: val } : c))
    );
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
            Homepage Sections Editor
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Visually customize titles, subtitles, dynamic content blocks, images, and highlights.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem", alignItems: "start" }}>
        {/* Sections List */}
        <Card style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem" }}>
            Landing Sections
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {sections.map((sec) => (
              <button
                key={sec.key}
                type="button"
                onClick={() => selectSection(sec)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 1rem",
                  borderRadius: "6px",
                  border: `1px solid ${selectedKey === sec.key ? "var(--color-primary)" : "var(--color-border)"}`,
                  background: selectedKey === sec.key ? "var(--color-primary-50)" : "transparent",
                  color: selectedKey === sec.key ? "var(--color-primary)" : "var(--color-text-primary)",
                  fontWeight: selectedKey === sec.key ? "600" : "500",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                }}
              >
                <span>{sec.key.toUpperCase()} Section</span>
                <Badge variant={sec.isActive ? "success" : "default"}>
                  {sec.isActive ? "Active" : "Disabled"}
                </Badge>
              </button>
            ))}
          </div>
        </Card>

        {/* Visual Customizer Workspace */}
        {selectedKey ? (
          <Card>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1.5rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              Editing: <span style={{ color: "var(--color-primary)", textTransform: "uppercase" }}>{selectedKey}</span>
            </h3>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <Input
                label="Section Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter section headline"
                required
              />

              <Input
                label="Section Subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Enter subtitle or mini-heading"
              />

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--color-text-secondary)" }}>
                  Main Body / Content Block
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Body content of the homepage section. Supports rich descriptions or scrapings."
                  rows={6}
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Input
                  label="Featured Image URL"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="/images/... or upload URL"
                />

                <Input
                  label="Display Order / Weight"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <label htmlFor="isActive" style={{ fontSize: "0.875rem", fontWeight: "500", cursor: "pointer" }}>
                  Section is active and visible on the landing page
                </label>
              </div>

              {/* Optional Section Statistics Metadata Counters */}
              {(selectedKey === "stats" || selectedKey === "about") && (
                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1.5rem", marginTop: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: "600", margin: 0 }}>Dynamic Highlight Counters</h4>
                    <Button type="button" size="sm" variant="outline" onClick={addCounterField}>
                      + Add Counter
                    </Button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {metaCounters.map((c, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: "1rem", alignItems: "end" }}>
                        <Input
                          label="Counter Label (e.g. Research Papers)"
                          value={c.label}
                          onChange={(e) => handleCounterChange(i, "label", e.target.value)}
                          placeholder="e.g. Publications"
                        />
                        <Input
                          label="Count Value (e.g. 500+)"
                          value={c.value}
                          onChange={(e) => handleCounterChange(i, "value", e.target.value)}
                          placeholder="e.g. 450+"
                        />
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => removeCounterField(i)}
                          style={{ marginBottom: "2px" }}
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "1rem", borderTop: "1px solid var(--color-border)", paddingTop: "1.5rem", marginTop: "1.5rem" }}>
                <Button type="submit" loading={savingKey === selectedKey}>
                  Save Homepage Layout Settings
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
            <p style={{ color: "var(--color-text-secondary)" }}>Please select a section from the left menu to customize.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
