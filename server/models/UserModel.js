import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  creditBalance: { type: Number, default: 5 },
});

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

export default UserModel;
