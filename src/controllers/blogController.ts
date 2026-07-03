import { Request, Response } from "express";
import prisma from "../services/prisma";
import { cloudinary } from "../utils/cloudinary";

// Helper function to generate clean URL slugs
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-")         // Replace spaces with dashes
    .trim();
};

// 1. CREATE A BLOG POST (With Image Upload)
export const createBlogPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, author } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: "Title and content fields are required." });
      return;
    }

    let imageUrl = null;

    // Upload cover image to Cloudinary if provided
    if (req.file) {
      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "real_estate_blogs" },
          (error: Error | undefined, result: { secure_url: string } | undefined) => {
            if (error) return reject(error);
            if (!result) return reject(new Error("Cloudinary upload failed: no response returned."));
            resolve(result);
          }
        );
        uploadStream.end(req.file!.buffer);
      });
      imageUrl = uploadResult.secure_url;
    }

    const baseSlug = generateSlug(title);
    // Ensure slug uniqueness by appending a timestamp
    const uniqueSlug = `${baseSlug}-${Date.now()}`;

    const newPost = await prisma.blogPost.create({
      data: {
        title,
        content,
        author: author || "Admin",
        coverImage: imageUrl,
        slug: uniqueSlug,
      },
    });

    res.status(201).json({ success: true, message: "Blog published!", data: newPost });
  } catch (error) {
    res.status(500).json({ error: "Failed to build blog post entry." });
  }
};

// 2. GET ALL BLOG POSTS (For Blog Feed)
export const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve blog posts." });
  }
};

// 3. GET A SINGLE BLOG POST BY SLUG (For Blog Details Page)
export const getBlogBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const slugParam = req.params.slug;
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

    if (!slug) {
      res.status(400).json({ error: "Slug is required." });
      return;
    }

    const post = await prisma.blogPost.findUnique({ where: { slug } });

    if (!post) {
      res.status(404).json({ error: "Blog article not found." });
      return;
    }

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch article details." });
  }
};

// 4. DELETE A BLOG POST
export const deleteBlogPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.blogPost.delete({ where: { id: Number(id) } });
    res.status(200).json({ success: true, message: "Blog entry deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove blog post." });
  }
};