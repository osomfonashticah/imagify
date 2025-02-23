import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import userRouter from "./routes/userRoute.js";
import imageRouter from "./routes/imageRoute.js";
import paymentRouter from "./routes/stripePaymentRoute.js";

const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

await connectDB();

app.use("/api/user", userRouter);
app.use("/api/image", imageRouter);
app.use("/api/payment", paymentRouter);
app.get("/", (req, res) => res.send("API Working"));

app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});
