import { Router } from "express";
import { getTestimonials, createTestimonial, deleteTestimonial } from "../controllers/testimonialController";
import { upload } from "../utils/cloudinary";

const router = Router();

router.get("/", getTestimonials);
router.post("/", upload.single("avatar"), createTestimonial); // 👈 'avatar' is the file key name
router.delete("/:id", deleteTestimonial);

export default router;