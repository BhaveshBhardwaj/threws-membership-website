"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import { ArrowRight, Search, Calendar, User, Tag } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";
import { getPublishedPosts } from "@/actions/blog.actions";
import Skeleton from "@/components/ui/Skeleton";
import type { BlogPostData } from "@/types";

const CATEGORIES = [
  "All",
  "Artificial Intelligence",
  "IoT & Sensors",
  "Cybersecurity",
  "Smart Grids",
  "VLSI & Hardware",
  "Telecommunications",
  "Community & Vision"
];

// Helper to get category specific color scheme for premium visual look
const getCategoryGradient = (category: string) => {
  switch (category) {
    case "Artificial Intelligence":
      return "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)"; // Royal blue gradient
    case "IoT & Sensors":
      return "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)"; // Teal gradient
    case "Cybersecurity":
      return "linear-gradient(135deg, #581c87 0%, #a855f7 100%)"; // Purple gradient
    case "Smart Grids":
      return "linear-gradient(135deg, #78350f 0%, #eab308 100%)"; // Golden amber gradient
    case "VLSI & Hardware":
      return "linear-gradient(135deg, #1e293b 0%, #475569 100%)"; // Steel/slate gradient
    case "Telecommunications":
      return "linear-gradient(135deg, #701a75 0%, #d946ef 100%)"; // Magenta gradient
    case "Community & Vision":
    default:
      return "linear-gradient(135deg, #030712 0%, #1e40af 100%)"; // Deep space blue gradient
  }
};

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    async function loadBlogs() {
      setLoading(true);
      try {
        const params: any = {
          limit: 30, // Get a healthy batch of historical and new articles
        };

        if (selectedCategory !== "All") {
          params.category = selectedCategory;
        }
        if (selectedTag) {
          params.tag = selectedTag;
        }
        if (search.trim()) {
          params.search = search.trim();
        }

        const res = await getPublishedPosts(params);
        if (res.success && res.data) {
          setBlogs(res.data);
        }
      } catch (err) {
        console.error("Failed to load blog posts:", err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadBlogs();
    }, 300); // Debounce typing search

    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedTag]);

  // Aggregate all unique tags from currently loaded blogs for micro filtering
  const allTags = Array.from(
    new Set(blogs.flatMap((blog) => blog.tags || []))
  ).slice(0, 12);

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return "Recent";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div style={{ background: "var(--color-bg-primary)", minHeight: "100vh" }}>
      {/* Premium Hero section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.glow1} />
          <div className={styles.glow2} />
        </div>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroBadge}>
            📰 Westbridge Chronicle
          </div>
          <h1 className={styles.title}>
            Scientific Insights & Retrospective
          </h1>
          <p className={styles.heroSubtitle}>
            Reviewing over 4 years of active scientific advancements, corporate research summits, and digital engineering publications.
          </p>
        </div>
      </section>

      {/* Filter & Search Bar Workspace */}
      <section className={styles.filterSection}>
        <div className="container">
          <div className={styles.filterContainer}>
            {/* Search Input and Category Selector */}
            <div className={styles.searchContainer}>
              <div className={styles.searchInputWrapper}>
                <div className={styles.searchIconWrapper}>
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search articles by title, tags, or content excerpt..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              {/* Categories Pills */}
              <div className={styles.categoriesWrapper}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedTag(null); // Reset tag filters when shifting categories
                    }}
                    className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.categoryBtnActive : ""}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Quick Filters */}
            {allTags.length > 0 && (
              <div className={styles.tagsContainer}>
                <span className={styles.tagLabel}>
                  <Tag size={12} /> Hot Tags:
                </span>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`${styles.tagBtn} ${selectedTag === tag ? styles.tagBtnActive : ""}`}
                  >
                    #{tag}
                  </button>
                ))}
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={styles.clearTagBtn}
                  >
                    Clear tag [x]
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Results Listing Grid */}
      <section className={styles.section}>
        <div className="container">
          {loading ? (
            <div className={styles.grid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Card
                  key={i}
                  className={styles.blogCard}
                  style={{ padding: 0 }}
                >
                  <Skeleton variant="rect" height={160} />
                  <div className={styles.blogCardBody}>
                    <div className={styles.blogCardMeta}>
                      <Skeleton variant="text" width={80} height={16} />
                      <Skeleton variant="text" width={60} height={16} />
                    </div>
                    <Skeleton variant="text" width="90%" height={24} style={{ marginTop: "0.5rem" }} />
                    <Skeleton variant="text" width="100%" height={16} />
                    <Skeleton variant="text" width="70%" height={16} />
                    <div className={styles.blogCardFooter}>
                      <div className={styles.blogCardAuthor}>
                        <Skeleton variant="circle" width={24} height={24} />
                        <Skeleton variant="text" width={80} height={14} />
                      </div>
                      <Skeleton variant="text" width={60} height={14} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <div className={styles.grid}>
              {blogs.map((blog) => (
                <Card
                  key={blog._id || blog.slug}
                  hover
                  className={styles.blogCard}
                  style={{ padding: 0 }}
                >
                  {/* Decorative Premium Cover Image Gradient */}
                  <div
                    className={styles.blogCardCover}
                    style={{ background: getCategoryGradient(blog.category || "") }}
                  >
                    <div className={styles.blogCardCoverGradient} />
                    <span className={styles.blogCardCoverWatermark}>
                      Westbridge
                    </span>
                    <h4 className={styles.blogCardCoverTitle}>
                      {blog.category} Research File
                    </h4>
                  </div>

                  {/* Body details */}
                  <div className={styles.blogCardBody}>
                    <div className={styles.blogCardMeta}>
                      <span className={styles.blogCardCategory}>
                        {blog.category}
                      </span>
                      <span className={styles.blogCardDate}>
                        <Calendar size={12} /> {formatDate(blog.publishedAt)}
                      </span>
                    </div>

                    <h3 className={styles.blogCardTitle}>
                      {blog.title}
                    </h3>

                    <p className={styles.blogCardExcerpt}>
                      {blog.excerpt}
                    </p>

                    {/* Author and Read More Action */}
                    <div className={styles.blogCardFooter}>
                      <div className={styles.blogCardAuthor}>
                        <div className={styles.blogCardAuthorAvatar}>
                          <User size={14} />
                        </div>
                        <span className={styles.blogCardAuthorName}>
                          {blog.author?.name || "Westbridge Research"}
                        </span>
                      </div>

                      <Link
                        href={`/blog/${blog.slug}`}
                        className={styles.blogCardLink}
                      >
                        Access Case <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* Beautiful Empty State */
            <div className={styles.emptyState}>
              <Search size={48} className={styles.emptyStateIcon} />
              <h3 className={styles.emptyStateTitle}>
                No Scientific Publications Found
              </h3>
              <p className={styles.emptyStateText}>
                We couldn't find any articles matching your search query "{search}". Try checking other categories or clearing your active filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                  setSelectedTag(null);
                }}
              >
                Reset Search Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
