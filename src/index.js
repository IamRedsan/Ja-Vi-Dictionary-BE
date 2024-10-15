import express from "express";
import dotenv from 'dotenv';
import { ErrorHanlder } from "./middlewares/ErrorHandler.js";
import cors from "cors";
import "express-async-errors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// router
import compositionRouter from "./routes/compositionRoutes.js"
import kanjiRouter from "./routes/kanjiRoutes.js";
import wordRouter from "./routes/wordRoutes.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/compositions", compositionRouter);
app.use("/api/v1/kanjis", kanjiRouter);
app.use("/api/v1/words", wordRouter);
app.use("/api/v1/users", userRouter);
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