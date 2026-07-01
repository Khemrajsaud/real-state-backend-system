import { Request, Response } from "express";
import prisma from "../services/prisma";

// 1. PUBLIC: Fetch all FAQs
export const getFaqs = async (req: Request, res: Response): Promise<void> => {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: { category: "asc" },
    });
    res.status(200).json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve FAQs." });
  }
};

// 2. ADMIN ONLY: Create a new FAQ entry
export const createFaq = async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, answer, category } = req.body;

    if (!question || !answer) {
      res.status(400).json({ error: "Both question and answer fields are required." });
      return;
    }

    const newFaq = await prisma.faq.create({
      data: {
        question,
        answer,
        category: category || "General",
      },
    });

    res.status(201).json({ success: true, message: "FAQ created successfully!", data: newFaq });
  } catch (error) {
    res.status(500).json({ error: "Failed to add FAQ entry." });
  }
};

// 3. ADMIN ONLY: Update an existing FAQ entry
export const updateFaq = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { question, answer, category } = req.body;

    const existingFaq = await prisma.faq.findUnique({ where: { id: Number(id) } });
    if (!existingFaq) {
      res.status(404).json({ error: "FAQ entry not found." });
      return;
    }

    const updatedFaq = await prisma.faq.update({
      where: { id: Number(id) },
      data: { question, answer, category },
    });

    res.status(200).json({ success: true, message: "FAQ updated perfectly!", data: updatedFaq });
  } catch (error) {
    res.status(500).json({ error: "Failed to modify FAQ details." });
  }
};

// 4. ADMIN ONLY: Delete an FAQ entry
export const deleteFaq = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existingFaq = await prisma.faq.findUnique({ where: { id: Number(id) } });
    if (!existingFaq) {
      res.status(404).json({ error: "FAQ entry target missing." });
      return;
    }

    await prisma.faq.delete({ where: { id: Number(id) } });
    res.status(200).json({ success: true, message: "FAQ deleted completely." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete target FAQ entry." });
  }
};