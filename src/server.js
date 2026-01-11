import 'dotenv/config';
import express from 'express'
import cors from 'cors'
import router_v1 from './routes/v1/route.js';
import connection from './config/mongodb.js'
import { corsOptions } from './config/corsOptions.js';
import cookieParser from "cookie-parser";
import { env } from './config/environment.js'
import { errorHandlingMiddleware } from './middleware/errorHandlingMiddleware.js';

const app = express();
const port = env.PORT || 8080;

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// use API v1
app.use('/api/v1/', router_v1);

app.use(errorHandlingMiddleware);

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