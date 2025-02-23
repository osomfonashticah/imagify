import express from "express";
import {
  stripePayment,
  verifyPayment,
} from "../controllers/stripeController.js";
import { auth } from "../middlewares/auth.js";

const paymentRouter = express.Router();

paymentRouter.post("/stripe-payment", auth, stripePayment);
paymentRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  verifyPayment
);

export default paymentRouter;
