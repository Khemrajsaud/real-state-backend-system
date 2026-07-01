
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("FATAL ERROR: Cloudinary credentials are not configured in environment variables.");
  console.error("Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in your .env file.");
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({});
export const upload = multer({ storage });

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
  try {
    const uploadResponse = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `real_estate/${folderName}`,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) {
            const statusCode = (error as any).http_code || (error as any).statusCode;
            const message = statusCode
              ? `Cloudinary upload failed with status ${statusCode}: ${error.message}`
              : `Cloudinary upload failed: ${error.message}`;
            const uploadError = new Error(message) as Error & { statusCode?: number };
            if (statusCode) {
              uploadError.statusCode = statusCode;
            }
            reject(uploadError);
            return;
          }

          if (!result) {
            reject(new Error("Cloudinary upload failed: no response returned."));
            return;
          }

          resolve(result);
        }
      );

      fs.createReadStream(file.path).pipe(uploadStream);
    });

    return {
      imageUrl: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    };
  } catch (error: any) {
    const wrappedError = new Error(`Cloudinary Upload Failed: ${error.message}`) as Error & { statusCode?: number };
    if (error.statusCode) {
      wrappedError.statusCode = error.statusCode;
    }
    throw wrappedError;
  } finally {
    if (file.path) {
      fs.promises.unlink(file.path).catch(() => undefined);
    }
  }
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