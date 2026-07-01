import { Request, Response } from "express";
import prisma from "../services/prisma"; // Adjust this path if your configured client is located elsewhere
import { cloudinary, uploadToCloudinary } from "../utils/cloudinary";

// 1. get all active banners
export const getBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const banners = await prisma.banner.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch banners" });
  }
};

// 2.  Upload a new  banner
export const uploadBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file as Express.Multer.File;
    if (!file) {
      res.status(400).json({ error: "Please upload an image file." });
      return;
    }

    const { title } = req.body;

    // Upload image to Cloudinary using your helper utility
    const { imageUrl, publicId } = await uploadToCloudinary(file, "banners");

    const newBanner = await prisma.banner.create({
      data: {
        title: title || "Untitled Banner",
        imageUrl,
        publicId,
      },
    });

    res.status(201).json({ success: true, message: "Banner uploaded successfully!", banner: newBanner });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || "Upload execution failed." });
  }
};

// 3.  Update an existing banner (Title, Image, or Both)
export const updateBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const file = req.file as Express.Multer.File;

    // Check if the target banner exists in the database
    const existingBanner = await prisma.banner.findUnique({ where: { id: Number(id) } });
    if (!existingBanner) {
      res.status(404).json({ error: "Banner item not found." });
      return;
    }

    // Initialize an object containing the payload properties that need to be updated
    let updateData: { title?: string; imageUrl?: string; publicId?: string } = {};

    if (title !== undefined) {
      updateData.title = title;
    }

    if (file) {
      if (existingBanner.publicId) {
        await cloudinary.uploader.destroy(existingBanner.publicId);
      }

      // 2. Upload the new asset layout to Cloudinary
      const { imageUrl, publicId } = await uploadToCloudinary(file, "banners");
      updateData.imageUrl = imageUrl;
      updateData.publicId = publicId;
    }

    // Update the record inside your database mapping
    const updatedBanner = await prisma.banner.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: "Banner updated successfully!",
      banner: updatedBanner,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || "Banner update operation failed." });
  }
};

// 4. Delete an existing banner
export const deleteBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const banner = await prisma.banner.findUnique({ where: { id: Number(id) } });
    if (!banner) {
      res.status(404).json({ error: "Banner item not found." });
      return;
    }

    // Remove file permanently from Cloudinary CDN bucket
    await cloudinary.uploader.destroy(banner.publicId);

    // Remove data log mapping from Database
    await prisma.banner.delete({ where: { id: Number(id) } });

    res.status(200).json({ success: true, message: "Banner deleted clean from storage and DB." });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || "Deletion routine failed." });
  }
};