// service/cloudinary.service.js
import cloudinary from "../config/cloudinary.js";

const generateUploadSignature = () => {
    const timestamp = Math.round(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
        {
            timestamp,
            folder: "upload-zine-blog"
        },
        process.env.CLOUDINARY_SECRET
    );

    return {
        timestamp,
        signature,
        apiKey: process.env.CLOUDINARY_KEY,
        cloudName: process.env.CLOUDINARY_NAME
    };
};

export const cloudinaryService = {
    generateUploadSignature
};
