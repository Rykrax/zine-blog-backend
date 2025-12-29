import 'dotenv/config'
import mongoose from 'mongoose'

const connection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log("MongoDB connected...");
    } catch (error) {
        console.log("Lỗi: ", error);
    }
}

export default connection;