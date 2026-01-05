import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import CloudinaryStorage from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "upload-zine-blog",
        allowed_formats: ["jpg", "png", "jpeg", "webp", "gif"],
        transformation: [
            { width: 1200, height: 630, crop: "limit" }
        ],
    },
});

const uploadPostImage = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
});

export default uploadPostImage;
