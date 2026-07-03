import { Router } from "express";
import { getFaqs, createFaq, updateFaq, deleteFaq } from "../controllers/faqController";

const router = Router();

// Public Discovery Route
router.get("/", getFaqs);

// Admin-Protected Management Routes
router.post("/", createFaq);
router.put("/:id", updateFaq);
router.delete("/:id", deleteFaq);


export default router;