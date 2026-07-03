import { Request, Response } from "express";
import prisma from "../services/prisma";

export const subscribeEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email target input required." });
      return;
    }
    const record = await prisma.subscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email },
    });
    res.status(201).json({ success: true, message: "Subscription verified!", data: record });
  } catch (error) {
    res.status(500).json({ error: "Failed to register newsletter subscription." });
  }
};

export const getSubscribers = async (req: Request, res: Response) => {
  try {
    const list = await prisma.subscriber.findMany();
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ error: "Failed to look up audience list." });
  }
};


