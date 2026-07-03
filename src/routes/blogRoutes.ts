import { Router } from "express";
import multer from "multer";
import { createBlogPost, getAllBlogs, getBlogBySlug, deleteBlogPost } from "../controllers/blogController";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("coverImage"), createBlogPost);
router.get("/", getAllBlogs);
router.get("/:slug", getBlogBySlug);
router.delete("/:id", deleteBlogPost);
export default router;






