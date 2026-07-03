import { Router } from "express";
import { toggleFavorite, getUserFavorites } from "../controllers/favoriteController";

const router = Router();




// Bookmark Collections
router.post("/favorites/", toggleFavorite);
router.get("/favorites/:userId", getUserFavorites);

export default router;