import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (base64: string) => {
  try {
    // Extract MIME type from the base64 string
    const mimeTypeMatch = base64.match(/^data:(.+);base64,/);
    if (!mimeTypeMatch) {
      throw new Error("Invalid base64 string. Unable to determine file type.");
    }

    const mimeType = mimeTypeMatch[1]; // e.g., "image/png", "image/jpeg"
    const buffer = Buffer.from(base64.split(",")[1], "base64"); // Remove metadata prefix

    // Validate MIME type (optional, can be customized for allowed types)
    const allowedMimeTypes = ["image/png", "image/jpeg", "image/gif"];
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    // Upload image to Cloudinary
    const result = (await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "image" }, // Optional: Restrict to images
          (error, result) => {
            if (error) reject(error);
            else resolve(result as { secure_url: string; public_id: string });
          }
        )
        .end(buffer);
    })) as { secure_url: string; public_id: string };

    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "An error occurred while uploading the image.");
  }
};

export const uploadVideo = async (base64: string) => {
  try {
    // Extract MIME type from the base64 string
    const mimeTypeMatch = base64.match(/^data:(.+);base64,/);
    if (!mimeTypeMatch) {
      throw new Error("Invalid base64 string. Unable to determine file type.");
    }

    const mimeType = mimeTypeMatch[1]; // e.g., "video/mp4", "video/webm"
    const buffer = Buffer.from(base64.split(",")[1], "base64"); // Remove metadata prefix

    // Validate MIME type (optional, can be customized for allowed types)
    const allowedMimeTypes = ["video/mp4", "video/webm", "video/ogg"];
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    // Upload video to Cloudinary
    const result = (await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "video" }, // Specify resource type as video
          (error, result) => {
            if (error) reject(error);
            else resolve(result as { secure_url: string; public_id: string });
          }
        )
        .end(buffer);
    })) as { secure_url: string; public_id: string };

    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "An error occurred while uploading the video.");
  }
};

export const deleteImage = async (publicId: string) => {
  try {
    console.log("Deleting image with publicId:", publicId);

    // Validate the publicId before proceeding
    if (!publicId || typeof publicId !== "string") {
      throw new Error("Invalid publicId: Must be a non-empty string.");
    }

    // Call the Cloudinary API to delete the image
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary destroy response:", result);

    // Handle specific Cloudinary responses
    if (result.result === "not found") {
      console.warn(`Image with publicId "${publicId}" was not found.`);
      return { success: false, message: `Image not found: ${publicId}`, status: 404 };
    }

    if (result.result !== "ok") {
      throw new Error(`Failed to delete image. Cloudinary response: ${result.result}`);
    }

    console.log(`Image with publicId "${publicId}" deleted successfully.`);
    return { success: true, message: `Image deleted: ${publicId}`, status: 200 };
  } catch (error) {
    console.error("Error in deleteImage:", error);
    throw new Error(error instanceof Error ? error.message : "An unknown error occurred while deleting the image.");
  }
};

export const deleteVideo = async (publicId: string) => {
  try {
    console.log("Deleting Video with publicId:", publicId);

    // Validate the publicId before proceeding
    if (!publicId || typeof publicId !== "string") {
      throw new Error("Invalid publicId: Must be a non-empty string.");
    }

    // Call the Cloudinary API to delete the image
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
    console.log("Cloudinary destroy response:", result);

    // Handle specific Cloudinary responses
    if (result.result === "not found") {
      console.warn(`Video with publicId "${publicId}" was not found.`);
      return { success: false, message: `Video not found: ${publicId}`, status: 404 };
    }

    if (result.result !== "ok") {
      throw new Error(`Failed to delete Video. Cloudinary response: ${result.result}`);
    }

    console.log(`Video with publicId "${publicId}" deleted successfully.`);
    return { success: true, message: `Video deleted: ${publicId}`, status: 200 };
  } catch (error) {
    console.error("Error in deleteVideo:", error);
    throw new Error(error instanceof Error ? error.message : "An unknown error occurred while deleting the Video.");
  }
};

export async function extractPublicId(url: string): Promise<string> {
  const fileName = url.split("/").pop();
  return fileName ? fileName.split(".")[0] : "";
}
export async function isCloudinaryUrl(url: string): Promise<boolean> {
  return url.trim().includes("res.cloudinary.com");
}
