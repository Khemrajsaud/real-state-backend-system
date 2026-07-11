import { Request, Response } from "express";
import prisma from "../services/prisma";
import { cloudinary, uploadMediaToCloudinary } from "../utils/cloudinary";

const parseAmenityIds = (amenityIds: unknown): number[] => {
  if (amenityIds === undefined || amenityIds === null || amenityIds === "") {
    return [];
  }

  if (Array.isArray(amenityIds)) {
    return amenityIds.map((id) => Number(id)).filter((id) => Number.isFinite(id));
  }

  if (typeof amenityIds === "string") {
    try {
      const parsed = JSON.parse(amenityIds);
      if (Array.isArray(parsed)) {
        return parsed.map((id) => Number(id)).filter((id) => Number.isFinite(id));
      }
    } catch {
      return amenityIds
        .split(",")
        .map((id) => Number(id.trim()))
        .filter((id) => Number.isFinite(id));
    }
  }

  return [];
};

// ==========================================
// 1. PUBLIC: Fetch All Listings with Filters
// ==========================================
export const getProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await prisma.properties.findMany({
      include: {
        category: true,
        status: true,
        images: true,
        videos: true,
        documents: true,
        property_amenities: { include: { amenity: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to retrieve property collection arrays." });
  }
};

// ==========================================
// 2. PUBLIC: Fetch Single Dynamic Property Details
// ==========================================
export const getPropertyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await prisma.properties.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        status: true,
        images: true,
        videos: true,
        documents: true,
        property_amenities: { include: { amenity: true } },
      },
    });

    if (!property) {
      res.status(404).json({ error: "Target real estate record not found." });
      return;
    }
    res.status(200).json({ success: true, property });
  } catch (error: any) {
    res.status(500).json({ error: "Error reading property record trace down." });
  }
};

// ==========================================
// 2.5 ADMIN: Fetch property form metadata
// ==========================================
export const getPropertyMeta = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [categories, statuses, amenities] = await Promise.all([
      prisma.category.findMany({ orderBy: { id: 'asc' } }),
      prisma.property_status.findMany({ orderBy: { id: 'asc' } }),
      prisma.amenities.findMany({ orderBy: { id: 'asc' } }),
    ])

    res.status(200).json({
      success: true,
      data: {
        categories,
        statuses,
        amenities,
      },
    })
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load property metadata.' })
  }
}

// ==========================================
// 3. ADMIN ONLY: Create New Multi-Media Property
// ==========================================
export const createProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, price, address, locationLink, categoryId, statusId, amenityIds } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!title || !description || !price || !address || !categoryId || !statusId) {
      res.status(400).json({ error: "Missing required core text body inputs." });
      return;
    }

    if (!files?.["propertyImages"] || files["propertyImages"].length === 0) {
      res.status(400).json({ error: "At least one property image is required." });
      return;
    }

    // Process parallel file group uploads via Cloudinary
    const uploadedImages = [];
    if (files?.["propertyImages"]) {
      for (const file of files["propertyImages"]) {
        const result = await uploadMediaToCloudinary(file, "properties/images", "image");
        uploadedImages.push({ image_url: result.imageUrl, publicId: result.publicId });
      }
    }

    const uploadedVideos = [];
    if (files?.["propertyVideos"]) {
      for (const file of files["propertyVideos"]) {
        const result = await uploadMediaToCloudinary(file, "properties/videos", "video");
        uploadedVideos.push({ video_url: result.imageUrl, publicId: result.publicId });
      }
    }

    const uploadedDocs = [];
    if (files?.["propertyDocs"]) {
      for (const file of files["propertyDocs"]) {
        const result = await uploadMediaToCloudinary(file, "properties/documents", "raw");
        uploadedDocs.push({ doc_url: result.imageUrl, doc_name: file.originalname, publicId: result.publicId });
      }
    }

    const parsedAmenityIds = parseAmenityIds(amenityIds);

    const newProperty = await prisma.properties.create({
      data: {
        title,
        description,
        price: Number(price),
        address,
        locationLink,
        categoryId: Number(categoryId),
        statusId: Number(statusId),
        images: { create: uploadedImages },
        videos: { create: uploadedVideos },
        documents: { create: uploadedDocs },
        property_amenities: {
          create: parsedAmenityIds.map((id: number) => ({ amenityId: id })),
        },
      },
      include: {
        category: true,
        status: true,
        images: true,
        videos: true,
        documents: true,
        property_amenities: { include: { amenity: true } },
      },
    });

    res.status(201).json({ success: true, message: "Property listed smoothly!", data: newProperty });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Pipeline building execution failed." });
  }
};

// ==========================================
// 4. ADMIN ONLY: Update Property (Text / Media)
// ==========================================
export const updateProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, price, address, locationLink, categoryId, statusId, amenityIds } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const targetProperty = await prisma.properties.findUnique({
      where: { id: Number(id) },
      include: { images: true, videos: true, documents: true },
    });

    if (!targetProperty) {
      res.status(404).json({ error: "Property entry reference missing." });
      return;
    }

    let updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (address !== undefined) updateData.address = address;
    if (locationLink !== undefined) updateData.locationLink = locationLink;
    if (categoryId !== undefined) updateData.categoryId = Number(categoryId);
    if (statusId !== undefined) updateData.statusId = Number(statusId);

    // If new images are added, upload them and merge/append to existing collection relations
    if (files?.["propertyImages"]) {
      const newImages = [];
      for (const file of files["propertyImages"]) {
        const result = await uploadMediaToCloudinary(file, "properties/images", "image");
        newImages.push({ image_url: result.imageUrl, publicId: result.publicId });
      }
      updateData.images = { create: newImages };
    }

    if (files?.["propertyVideos"]) {
      const newVideos = [];
      for (const file of files["propertyVideos"]) {
        const result = await uploadMediaToCloudinary(file, "properties/videos", "video");
        newVideos.push({ video_url: result.imageUrl, publicId: result.publicId });
      }
      updateData.videos = { create: newVideos };
    }

    if (files?.["propertyDocs"]) {
      const newDocs = [];
      for (const file of files["propertyDocs"]) {
        const result = await uploadMediaToCloudinary(file, "properties/documents", "raw");
        newDocs.push({ doc_url: result.imageUrl, doc_name: file.originalname, publicId: result.publicId });
      }
      updateData.documents = { create: newDocs };
    }

    // Sync many-to-many amenities array modifications if supplied
    if (amenityIds !== undefined) {
      const parsedAmenityIds = parseAmenityIds(amenityIds);
      updateData.property_amenities = {
        deleteMany: {}, // Clear past connection pairings
        create: parsedAmenityIds.map((id: number) => ({ amenityId: id })), // Establish fresh updates
      };
    }

    const updated = await prisma.properties.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        category: true,
        status: true,
        images: true,
        videos: true,
        documents: true,
        property_amenities: { include: { amenity: true } },
      },
    });

    res.status(200).json({ success: true, message: "Property updated successfully!", data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Update routine mapping failed." });
  }
};

// ==========================================
// 5. ADMIN ONLY: Safe Cascading Deletion
// ==========================================
export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const property = await prisma.properties.findUnique({
      where: { id: Number(id) },
      include: { images: true, videos: true, documents: true },
    });

    if (!property) {
      res.status(404).json({ error: "Listing tracking instance not found." });
      return;
    }

    // Wipe out image files completely inside your Cloudinary bucket setup
    for (const img of property.images) {
      await cloudinary.uploader.destroy(img.publicId);
    }

    // Wipe out video formats matching this context
    for (const vid of property.videos) {
      await cloudinary.uploader.destroy(vid.publicId, { resource_type: "video" });
    }

    // Wipe out secure document raw layouts
    for (const doc of property.documents) {
      await cloudinary.uploader.destroy(doc.publicId, { resource_type: "raw" });
    }

    // Database record trace drop (Deletes child arrays automatically via schema cascade setups)
    await prisma.properties.delete({ where: { id: Number(id) } });

    res.status(200).json({ success: true, message: "Property and all connected cloud assets purged successfully." });
  } catch (error: any) {
    res.status(500).json({ error: "Asset purge pipeline run crashed down." });
  }
};