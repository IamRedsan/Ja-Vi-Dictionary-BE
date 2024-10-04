import express from "express";
import compositionRouter from "./routes/compositionRoutes.js"
import kanjiRouter from "./routes/kanjiRoutes.js";
import wordRouter from "./routes/wordRoutes.js"

const app = express();
app.use(express.json());

// router
app.use("/api/v1/compositions", compositionRouter);
app.use("/api/v1/kanjis", kanjiRouter);
app.use("/api/v1/words", wordRouter);

//Connect Database
import connectDB from "./database/connect.js";

const start = async () => {
    try {
        const port = 5000;
        await connectDB(String(process.env.MONGO_URL));
        app.listen(port, () => {
            console.log('Listening ' + port);
        });
    } catch (error) {
        console.log(error);
    }
};

start();