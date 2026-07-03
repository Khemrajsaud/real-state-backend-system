import { Request, Response } from "express";
import prisma from "../services/prisma";
import { cloudinary } from "../utils/cloudinary";

// 1. Get current user profile data
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params; // In production, grab this from your verified JWT token payload instead

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { id: true, name: true, email: true, phone: true, dob: true, avatar: true }
    });

    if (!user) {
      res.status(404).json({ error: "User account not found." });
      return;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ error: "Failed to load user profile." });
  }
};

// 2. Update text fields (Name, Phone, Date of Birth)
export const updateProfileText = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { name, phone, dob } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        name,
        phone,
        dob: dob ? new Date(dob) : undefined, // Formats string date (YYYY-MM-DD) safely for Prisma
      },
      select: { id: true, name: true, email: true, phone: true, dob: true, avatar: true }
    });

    res.status(200).json({ success: true, message: "Profile details updated!", data: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile information." });
  }
};

// 3. Upload or Update Avatar Image
export const updateProfileAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!req.file) {
      res.status(400).json({ error: "No image file provided." });
      return;
    }

    // Upload image buffer straight to Cloudinary profile folder
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "user_avatars" },
        (error: Error | undefined, result: { secure_url: string } | undefined) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Cloudinary upload failed: no response returned."));
          resolve(result);
        }
      );
      uploadStream.end(req.file!.buffer);
    });

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: { avatar: uploadResult.secure_url },
      select: { id: true, name: true, avatar: true }
    });

    res.status(200).json({ success: true, message: "Avatar picture uploaded!", data: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload avatar image." });
  }
};

// 4. Delete Profile completely
export const deleteProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) {
      res.status(404).json({ error: "Account does not exist." });
      return;
    }

    // Delete user from DB
    await prisma.user.delete({ where: { id: Number(userId) } });

    res.status(200).json({ success: true, message: "Your profile has been permanently deleted." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user account." });
  }
};