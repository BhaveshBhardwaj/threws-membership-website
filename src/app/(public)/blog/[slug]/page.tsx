import React from "react";
import Link from "next/link";
import { getPostBySlug, getPublishedPosts } from "@/actions/blog.actions";
import { ArrowLeft, Calendar, User, Eye, BookOpen, Share2 } from "lucide-react";
import Card from "@/components/ui/Card";
import styles from "../page.module.css";
import { notFound } from "next/navigation";

// Generate dynamic metadata for search engines (SEO best practices)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await getPostBySlug(slug);
  if (!res.success || !res.data) {
    return {
      title: "Article Not Found | Westbridge Research",
    };
  }
  return {
    title: `${res.data.title} | Westbridge Research Publications`,
    description: res.data.excerpt,
    openGraph: {
      title: res.data.title,
      description: res.data.excerpt,
      type: "article",
    },
  };
}

const getCategoryGradient = (category: string) => {
  switch (category) {
    case "Artificial Intelligence":
      return "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)";
    case "IoT & Sensors":
      return "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)";
    case "Cybersecurity":
      return "linear-gradient(135deg, #581c87 0%, #a855f7 100%)";
    case "Smart Grids":
      return "linear-gradient(135deg, #78350f 0%, #eab308 100%)";
    case "VLSI & Hardware":
      return "linear-gradient(135deg, #1e293b 0%, #475569 100%)";
    case "Telecommunications":
      return "linear-gradient(135deg, #701a75 0%, #d946ef 100%)";
    case "Community & Vision":
    default:
      return "linear-gradient(135deg, #030712 0%, #1e40af 100%)";
  }
};

export default async function BlogPostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Fetch post details (increments views automatically)
  const res = await getPostBySlug(slug);
  if (!res.success || !res.data) {
    notFound();
  }

  const post = res.data;

  // Fetch recent posts to display in the sidebar as related publications
  const recentRes = await getPublishedPosts({ limit: 4 });
  const recentPosts = recentRes.success && recentRes.data 
    ? recentRes.data.filter((p) => p.slug !== slug).slice(0, 3)
    : [];

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return "Recent";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div style={{ background: "var(--color-bg-primary)", minHeight: "100vh", paddingBlock: "3rem 6rem" }}>
      <div className="container">
        {/* Back Link */}
        <div style={{ marginBottom: "2rem" }}>
          <Link
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--color-text-secondary)",
              textDecoration: "none",
              fontSize: "0.95rem",
              fontWeight: "600",
              transition: "color 0.2s ease"
            }}
          >
            <ArrowLeft size={16} /> Back to Publications List
          </Link>
        </div>

        {/* Dynamic Grid Layout */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "3rem",
        }}>
          {/* Main Article Workspace */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "2rem"
          }}>
            <article style={{
              backgroundColor: "var(--color-bg-primary)",
              borderRadius: "16px",
              overflow: "hidden"
            }}>
              {/* Category, Date, Views */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                <span style={{
                  fontSize: "0.8rem",
                  color: "var(--color-primary-dark)",
                  backgroundColor: "var(--color-primary-50)",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "9999px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  {post.category}
                </span>

                <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Calendar size={15} /> {formatDate(post.publishedAt)}
                </span>

                <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Eye size={15} /> {post.views || 0} views
                </span>
              </div>

              {/* Title */}
              <h1 style={{
                fontSize: "var(--text-3xl)",
                fontWeight: "800",
                lineHeight: "1.25",
                color: "var(--color-text-primary)",
                marginBottom: "2rem",
                letterSpacing: "-0.02em"
              }}>
                {post.title}
              </h1>

              {/* Author & Actions Row */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBlock: "1rem",
                borderBlock: "1px solid var(--color-border)",
                marginBottom: "2.5rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-primary-50)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-primary)",
                    fontSize: "1rem",
                    fontWeight: "700"
                  }}>
                    {post.author?.name ? post.author.name.charAt(0) : "D"}
                  </div>
                  <div>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--color-text-primary)", margin: 0 }}>
                      {post.author?.name || "Westbridge Research"}
                    </h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", margin: 0 }}>
                      Westbridge Research Fellow
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    background: "transparent",
                    color: "var(--color-text-secondary)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                  }}>
                    <Share2 size={14} /> Share
                  </button>
                </div>
              </div>

              {/* Premium Gradient Banner Placeholder */}
              <div
                style={{
                  width: "100%",
                  height: "300px",
                  background: getCategoryGradient(post.category || ""),
                  borderRadius: "12px",
                  marginBottom: "3rem",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff"
                }}
              >
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 80%)",
                  pointerEvents: "none"
                }} />
                <div style={{ textAlign: "center", zIndex: 1, padding: "2rem" }}>
                  <BookOpen size={48} style={{ marginBottom: "1rem", opacity: 0.8 }} />
                  <p style={{ fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.8, margin: 0 }}>
                    Westbridge Research Syndicate File
                  </p>
                  <p style={{ fontSize: "1.1rem", fontWeight: "600", marginTop: "0.5rem", opacity: 0.9 }}>
                    Document Reference: WBR-J-{post.slug.substring(0,6).toUpperCase()}-2026
                  </p>
                </div>
              </div>

              {/* Excerpt Block */}
              <div style={{
                fontSize: "1.15rem",
                lineHeight: "1.6",
                color: "var(--color-text-primary)",
                fontStyle: "italic",
                paddingLeft: "1.5rem",
                borderLeft: "4px solid var(--color-primary)",
                marginBottom: "2.5rem"
              }}>
                {post.excerpt}
              </div>

              {/* HTML Content (Rich text) */}
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: post.content }}
                style={{
                  fontSize: "1.05rem",
                  lineHeight: "1.8",
                  color: "var(--color-text-secondary)",
                }}
              />

              {/* Tags Section */}
              {post.tags && post.tags.length > 0 && (
                <div style={{
                  marginTop: "4rem",
                  paddingTop: "2rem",
                  borderTop: "1px solid var(--color-border)",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-text-muted)", marginRight: "0.5rem" }}>
                    Indexed Keywords:
                  </span>
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        backgroundColor: "var(--color-bg-secondary)",
                        color: "var(--color-text-secondary)",
                        border: "1px solid var(--color-border)"
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </article>

            {/* Public Sidebar Row: Related Publications and CTA */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "2rem",
              marginTop: "4rem",
              paddingTop: "3rem",
              borderTop: "2px solid var(--color-border)"
            }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                Related Research & Chronicles
              </h3>
              
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "1.5rem"
              }}>
                {recentPosts.map((rp) => (
                  <Card key={rp._id || rp.slug} hover style={{ padding: "1.5rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: "700", textTransform: "uppercase", display: "inline-block", marginBottom: "0.5rem" }}>
                      {rp.category}
                    </span>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.5rem", lineHeight: "1.4" }}>
                      <Link href={`/blog/${rp.slug}`} style={{ color: "var(--color-text-primary)", textDecoration: "none" }}>
                        {rp.title}
                      </Link>
                    </h4>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
                      {rp.excerpt}
                    </p>
                    <Link href={`/blog/${rp.slug}`} style={{ fontSize: "0.875rem", color: "var(--color-primary)", fontWeight: "600", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                      Access Document →
                    </Link>
                  </Card>
                ))}
              </div>

              {/* Fellowship Syndicate CTA Card */}
              <Card style={{
                background: "linear-gradient(135deg, #030712 0%, #1e3a8a 100%)",
                color: "#ffffff",
                padding: "2rem",
                borderRadius: "12px",
                position: "relative",
                overflow: "hidden",
                border: "none",
                marginTop: "1.5rem"
              }}>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(circle at right bottom, rgba(59, 130, 246, 0.2) 0%, rgba(0,0,0,0) 80%)",
                  pointerEvents: "none"
                }} />
                <span style={{
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  letterSpacing: "0.1em",
                  color: "#eab308",
                  textTransform: "uppercase",
                  display: "inline-block",
                  marginBottom: "0.75rem"
                }}>
                  ACADEMIC MEMBERSHIP
                </span>
                <h3 style={{ fontSize: "1.35rem", fontWeight: "800", marginBottom: "0.75rem", color: "#ffffff" }}>
                  Join the Westbridge Research Syndicate
                </h3>
                <p style={{ fontSize: "0.875rem", opacity: 0.8, lineHeight: "1.6", marginBottom: "1.5rem" }}>
                  Apply for accredited Fellow or Senior memberships to collaborate with global scientists, publish peer-reviewed studies, and represent scientific committees.
                </p>
                <Link
                  href="/membership"
                  className="hover-opacity-90"
                  style={{
                    display: "inline-block",
                    padding: "0.6rem 1.25rem",
                    borderRadius: "6px",
                    backgroundColor: "#eab308",
                    color: "#0f172a",
                    fontSize: "0.875rem",
                    fontWeight: "700",
                    textDecoration: "none",
                  }}
                >
                  Submit Membership Application
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
