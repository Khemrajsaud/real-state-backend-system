import { Request, Response } from "express";
import prisma from "../services/prisma";

export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const { userId, propertyId } = req.body; // In real staging, derive userId from your auth req middleware token

    const existing = await prisma.favorite.findUnique({
      where: { userId_propertyId: { userId: Number(userId), propertyId: Number(propertyId) } }
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      res.status(200).json({ success: true, message: "Removed listing from your bookmarks collection." });
    } else {
      const added = await prisma.favorite.create({ data: { userId: Number(userId), propertyId: Number(propertyId) } });
      res.status(201).json({ success: true, message: "Added listing to favorites!", data: added });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to process listing bookmark action." });
  }
};

export const getUserFavorites = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const items = await prisma.favorite.findMany({ where: { userId: Number(userId) } });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ error: "Failed to load bookmark listing indices." });
  }
};