import mongoose from "mongoose";

const transctionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  plan: { type: String, required: true },
  amount: { type: Number, required: true },
  credits: { type: Number, required: true },
  payment: { type: Boolean, default: false },
  date: { type: Number },
});

const transactionModel = mongoose.model("transaction", transctionSchema);

export default transactionModel;
