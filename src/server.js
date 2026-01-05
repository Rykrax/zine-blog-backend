import 'dotenv/config';
import express from 'express'
import cors from 'cors'
import router_v1 from './routes/v1/route.js';
import connection from './config/mongodb.js'
import { corsOptions } from './config/corsOptions.js';
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT || 8080;

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/', router_v1);

(async () => {
    try {
        connection();
        app.listen(port, () => {
            console.log(`Server chạy trên "http://localhost:${port}"`);
        })
    } catch (error) {
        console.log(error);
    }
})()