"use server";

import dbConnect from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import { auth } from "@/lib/auth";
import { blogPostSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import type { ApiResponse, BlogPostData } from "@/types";
import type { IBlogPost } from "@/models/BlogPost";

/* ────────── Public: Get Published Posts (paginated) ─────────────────── */

interface GetPublishedPostsParams {
  page?: number;
  limit?: number;
  tag?: string;
  category?: string;
  search?: string;
}

export async function getPublishedPosts(
  params: GetPublishedPostsParams = {}
): Promise<ApiResponse<BlogPostData[]>> {
  try {
    const { page = 1, limit = 12, tag, category, search } = params;

    await dbConnect();

    const filter: Record<string, any> = {
      status: "published",
      publishedAt: { $lte: new Date() },
    };
    if (tag) filter.tags = tag;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      BlogPost.find(filter)
        .select("-content") // exclude heavy content field for listing
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(filter),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(posts)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("getPublishedPosts error:", error);
    return { success: false, error: "Failed to fetch posts" };
  }
}

/* ────────── Public: Get Post by Slug (increments views) ────────────── */

export async function getPostBySlug(
  slug: string
): Promise<ApiResponse<BlogPostData>> {
  try {
    await dbConnect();

    const post = await BlogPost.findOneAndUpdate(
      { slug, status: "published" },
      { $inc: { views: 1 } },
      { returnDocument: "after" }
    ).lean();

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(post)),
    };
  } catch (error) {
    console.error("getPostBySlug error:", error);
    return { success: false, error: "Failed to fetch post" };
  }
}

/* ────────── Admin: Get All Posts ────────────────────────────────────── */

interface GetAllPostsParams {
  page?: number;
  limit?: number;
  status?: "draft" | "published";
  search?: string;
}

export async function getAllPosts(
  params: GetAllPostsParams = {}
): Promise<ApiResponse<BlogPostData[]>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const { page = 1, limit = 20, status, search } = params;

    await dbConnect();

    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      BlogPost.find(filter)
        .select("-content")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(filter),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(posts)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("getAllPosts error:", error);
    return { success: false, error: "Failed to fetch posts" };
  }
}

/* ────────── Admin: Create Post ─────────────────────────────────────── */

export async function createPost(
  data: Omit<BlogPostData, "_id" | "slug" | "views" | "createdAt" | "updatedAt">
): Promise<ApiResponse<BlogPostData>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = blogPostSchema.safeParse(data);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Validation failed",
      };
    }

    await dbConnect();

    // Generate a unique slug
    let slug = slugify(parsed.data.title);
    const existingSlug = await BlogPost.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const postData: Record<string, unknown> = {
      ...parsed.data,
      slug,
      views: 0,
    };

    // Set publishedAt when status is published
    if (parsed.data.status === "published") {
      postData.publishedAt = new Date();
    }

    const post = await BlogPost.create(postData);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(post)),
      message: "Post created successfully",
    };
  } catch (error) {
    console.error("createPost error:", error);
    return { success: false, error: "Failed to create post" };
  }
}

/* ────────── Admin: Update Post ─────────────────────────────────────── */

export async function updatePost(
  postId: string,
  data: Partial<BlogPostData>
): Promise<ApiResponse<BlogPostData>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = blogPostSchema.partial().safeParse(data);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Validation failed",
      };
    }

    await dbConnect();

    const existingPost = await BlogPost.findById(postId);
    if (!existingPost) {
      return { success: false, error: "Post not found" };
    }

    const updateData: Record<string, unknown> = { ...parsed.data };

    // If title changed, regenerate slug
    if (parsed.data.title && parsed.data.title !== existingPost.title) {
      let newSlug = slugify(parsed.data.title);
      const slugConflict = await BlogPost.findOne({
        slug: newSlug,
        _id: { $ne: postId },
      });
      if (slugConflict) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
      updateData.slug = newSlug;
    }

    // Set publishedAt when transitioning from draft to published
    if (
      parsed.data.status === "published" &&
      existingPost.status === "draft"
    ) {
      updateData.publishedAt = new Date();
    }

    const post = await BlogPost.findByIdAndUpdate(
      postId,
      updateData,
      { returnDocument: "after", runValidators: true }
    ).lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(post)),
      message: "Post updated successfully",
    };
  } catch (error) {
    console.error("updatePost error:", error);
    return { success: false, error: "Failed to update post" };
  }
}

/* ────────── Admin: Delete Post ─────────────────────────────────────── */

export async function deletePost(
  postId: string
): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    const post = await BlogPost.findByIdAndDelete(postId);

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    return {
      success: true,
      message: "Post deleted successfully",
    };
  } catch (error) {
    console.error("deletePost error:", error);
    return { success: false, error: "Failed to delete post" };
  }
}
