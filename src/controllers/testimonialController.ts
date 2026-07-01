import { Request, Response } from "express";
import prisma from "../services/prisma";
import { cloudinary } from "../utils/cloudinary";

// 1. PUBLIC: Fetch all testimonials for the website carousel/grid
export const getTestimonials = async (req: Request, res: Response): Promise<void> => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, testimonials });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
};

// 2. ADMIN ONLY: Add a new client testimonial
export const createTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientName, role, company, message, rating } = req.body;
    const file = req.file as Express.Multer.File;

    if (!clientName || !message || !rating) {
      res.status(400).json({ error: "Client name, message, and rating are required." });
      return;
    }

    let avatarUrl = null;
    let publicId = null;

    // Upload client profile picture if provided
    if (file) {
      const uploadResponse = await cloudinary.uploader.upload(file.path, {
        folder: "real_estate/testimonials",
      });
      avatarUrl = uploadResponse.secure_url;
      publicId = uploadResponse.public_id;
    }

    const newTestimonial = await prisma.testimonial.create({
      data: {
        clientName,
        role: role || "Client",
        company,
        message,
        rating: Number(rating),
        avatarUrl,
        publicId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Testimonial added successfully!",
      testimonial: newTestimonial,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create testimonial." });
  }
};

// 3. ADMIN ONLY: Remove a testimonial and its avatar from Cloudinary
export const deleteTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id: Number(id) },
    });

    if (!testimonial) {
      res.status(404).json({ error: "Testimonial not found." });
      return;
    }

    // Delete image from Cloudinary if it exists
    if (testimonial.publicId) {
      await cloudinary.uploader.destroy(testimonial.publicId);
    }

    // Delete record from database
    await prisma.testimonial.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ success: true, message: "Testimonial deleted completely." });
  } catch (error) {
    res.status(500).json({ error: "Failed to execute testimonial deletion." });
  }
};