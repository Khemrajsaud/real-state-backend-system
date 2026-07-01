import { Router } from "express";
import { getBanners, uploadBanner, updateBanner, deleteBanner } from "../controllers/bannerController";
import { upload } from "../utils/cloudinary";

const router = Router();

router.get("/", getBanners);
router.post("/upload", upload.single("bannerImage"), uploadBanner);

router.put("/:id", upload.single("bannerImage"), updateBanner); 

router.delete("/:id", deleteBanner);

export default router;