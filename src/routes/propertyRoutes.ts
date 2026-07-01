import { Router } from "express";
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/propertyController";
import { upload } from "../utils/cloudinary";

const router = Router();

router.get("/", getProperties);
router.get("/:id", getPropertyById);

router.post(
  "/",
  upload.fields([
    { name: "propertyImages", maxCount: 10 },
    { name: "propertyVideos", maxCount: 2 },
    { name: "propertyDocs", maxCount: 5 },
  ]),
  createProperty
);

router.put(
  "/:id",
  upload.fields([
    { name: "propertyImages", maxCount: 5 },
    { name: "propertyVideos", maxCount: 1 },
    { name: "propertyDocs", maxCount: 2 },
  ]),
  updateProperty
);

router.delete("/:id", deleteProperty);

export default router;