import { cloudinaryService } from "../service/cloudinary.service.js";

const getUploadSignature = async (req, res) => {
    const data = cloudinaryService.generateUploadSignature();
    res.json(data);
};

export const cloudinaryController = {
    getUploadSignature
};