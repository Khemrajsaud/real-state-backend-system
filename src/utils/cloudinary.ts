
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("FATAL ERROR: Cloudinary credentials are not configured in environment variables.");
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const upload = multer({ storage: multer.memoryStorage() });

interface CloudinaryUploadResult {
  imageUrl: string;
  publicId: string;
}

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
}

type CloudinaryResourceType = "image" | "video" | "raw";

const uploadFileToCloudinary = async (
  file: Express.Multer.File,
  folderName: string,
  resourceType: CloudinaryResourceType
): Promise<CloudinaryUploadResult> => {
  const uploadResponse = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: `real_estate/${folderName}`, resource_type: resourceType },
      (error, result) => {
        if (error) reject(new Error(`Cloudinary upload failed: ${error.message}`));
        else if (!result) reject(new Error("Cloudinary upload failed: no response returned."));
        else resolve(result);
      }
    );
    uploadStream.end(file.buffer);
  });

  return {
    imageUrl: uploadResponse.secure_url,
    publicId: uploadResponse.public_id,
  };
};

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folderName: string
): Promise<CloudinaryUploadResult> => {
  return uploadFileToCloudinary(file, folderName, "image");
};

export const uploadMediaToCloudinary = async (
  file: Express.Multer.File,
  folderName: string,
  resourceType: CloudinaryResourceType
): Promise<CloudinaryUploadResult> => {
  return uploadFileToCloudinary(file, folderName, resourceType);
};
export { cloudinary };