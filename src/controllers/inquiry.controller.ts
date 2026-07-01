import { Request, Response } from "express";
import prisma from "../services/prisma"; // Direct connection to your shared prisma instance

// 1. PUBLIC: SUBMIT ENQUIRY FORM
export const submitInquiry = async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, message } = req.body;

  // Guard Rail: Check if all required fields are present
  if (!name || !email || !phone || !message) {
    res.status(400).json({ error: "All fields (name, email, phone, message) are required." });
    return;
  }

  try {
    // Create record directly using your prisma instance
    const newInquiry = await prisma.property_inquiries.create({
      data: {
        name,
        email,
        phone,
        message,
      },
    });

    res.status(201).json({
      message: "Enquiry submitted successfully!",
      inquiry: newInquiry,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Something went wrong while submitting the enquiry." });
  }
};

// 2. ADMIN ONLY: GET ALL SUBMITTED ENQUIRIES
export const getAllInquiries = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all records sorted by the newest first
    const inquiries = await prisma.property_inquiries.findMany({
      orderBy: {
        createdAt: "desc", // Assumes you have a createdAt timestamp in your schema
      },
    });

    res.status(200).json(inquiries);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to retrieve enquiries." });
  }
};