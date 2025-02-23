import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import userRouter from "./routes/userRoute.js";
import imageRouter from "./routes/imageRoute.js";
import paymentRouter from "./routes/stripePaymentRoute.js";
import { verifyPayment } from "./controllers/stripeController.js";

const app = express();

const PORT = process.env.PORT || 4000;

await connectDB();

app.use("/webhook", express.raw({ type: "application/json" }), verifyPayment);
app.use(cors());
app.use(express.json());

app.use("/api/payment", paymentRouter);

app.use("/api/user", userRouter);
app.use("/api/image", imageRouter);

app.get("/", (req, res) => res.send("API Working"));

app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});
