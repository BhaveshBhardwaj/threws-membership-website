"use client";

import React, { useState, useEffect, useRef } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
import Loader from "@/components/ui/Loader";
import { getMediaFiles, deleteMediaFile } from "@/actions/media.actions";

interface MediaFile {
  name: string;
  url: string;
  size: number;
  updatedAt: string;
}

export default function MediaManagerPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load all uploads
  const loadFiles = async () => {
    try {
      const res = await getMediaFiles();
      if (res.success && res.data) {
        setFiles(res.data);
      } else {
        showToast(res.error || "Failed to load uploads folder", "error");
      }
    } catch (err) {
      showToast("Error retrieving media files", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast("Link copied to clipboard!", "success");
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}" from disk?`)) return;

    try {
      setDeletingName(name);
      const res = await deleteMediaFile(name);
      if (res.success) {
        setFiles((prev) => prev.filter((f) => f.name !== name));
        showToast(res.message || "File deleted successfully!", "success");
      } else {
        showToast(res.error || "Failed to delete file", "error");
      }
    } catch (err) {
      showToast("Something went wrong", "error");
    } finally {
      setDeletingName(null);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0];
    // Simple validation
    if (file.size > 5 * 1024 * 1024) {
      showToast("File is too large. Max size is 5MB.", "error");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        showToast("Image uploaded successfully!", "success");
        // Reload list
        loadFiles();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        showToast(data.error || "Failed to upload file", "error");
      }
    } catch (err) {
      showToast("Error uploading file", "error");
    } finally {
      setUploading(false);
    }
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isImageFile = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext || "");
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
            Media & Uploads Manager
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Upload files dynamically, copy image absolute URLs for CMS layout integration, and securely purge files from local disk.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: "none" }}
          />
          <Button onClick={triggerUploadClick} loading={uploading}>
            📤 Upload New Asset (Max 5MB)
          </Button>
        </div>
      </div>

      {files.length === 0 ? (
        <Card style={{ padding: "5rem 2rem", textAlign: "center" }}>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "1.125rem" }}>No media files uploaded yet.</p>
          <Button onClick={triggerUploadClick} style={{ marginTop: "1rem" }}>
            Upload Your First Image
          </Button>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.5rem" }}>
          {files.map((file) => (
            <Card key={file.name} style={{ display: "flex", flexDirection: "column", padding: "0.75rem", gap: "0.75rem" }}>
              {/* Asset Preview Frame */}
              <div
                style={{
                  height: "140px",
                  borderRadius: "6px",
                  background: "var(--color-bg-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  border: "1px solid var(--color-border)",
                  position: "relative",
                }}
              >
                {isImageFile(file.name) ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ fontSize: "2rem" }}>📄</span>
                )}
              </div>

              {/* Asset Metadata */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <p
                    style={{
                      fontWeight: "600",
                      fontSize: "0.875rem",
                      color: "var(--color-text-primary)",
                      margin: 0,
                      wordBreak: "break-all",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {file.name}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", margin: "0.25rem 0 0" }}>
                    Size: {formatBytes(file.size)}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                  <Button size="sm" variant="outline" onClick={() => handleCopyLink(file.url)} style={{ flex: 1 }}>
                    Copy Path
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={deletingName === file.name}
                    onClick={() => handleDelete(file.name)}
                    style={{ padding: "0.25rem 0.5rem" }}
                  >
                    {deletingName === file.name ? "..." : "🗑️"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
