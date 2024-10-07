import express from "express";
import compositionRouter from "./routes/compositionRoutes.js"
import kanjiRouter from "./routes/kanjiRoutes.js";
import wordRouter from "./routes/wordRoutes.js"
import dotenv from 'dotenv';
import { ErrorHanlder } from "./middlewares/ErrorHandler.js";

dotenv.config();

const app = express();
app.use(express.json());

// router
app.use("/api/v1/compositions", compositionRouter);
app.use("/api/v1/kanjis", kanjiRouter);
app.use("/api/v1/words", wordRouter);
app.use(ErrorHanlder);

//Connect Database
import connectDB from "./database/connect.js";

const start = async () => {
    try {
        console.log((process.env));
        await connectDB(String(process.env.MONGODB_URI));
        app.listen(process.env.PORT, () => {
            console.log('Listening ' + process.env.PORT);
        });
    } catch (error) {
        console.log(error);
    }
};

start();