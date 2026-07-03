import { Router } from "express";
import multer from "multer";
import { getProfile, updateProfileText, updateProfileAvatar, deleteProfile } from "../controllers/profileController";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Profile Actions mapped out by User ID
router.get("/:userId", getProfile);
router.put("/:userId/text", updateProfileText);
router.put("/:userId/avatar", upload.single("avatar"), updateProfileAvatar);
router.delete("/:userId", deleteProfile);

export default router;