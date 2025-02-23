import express from "express";
import {
  registerUser,
  loginUser,
  userCredits,
} from "../controllers/userController.js";
import { auth } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/credits", auth, userCredits);

export default userRouter;
