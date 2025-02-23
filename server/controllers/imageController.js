import UserModel from "../models/UserModel.js";
import { generateImage1 } from "../utils/generateChatgptImage.js";

export const generateImage = async (req, res) => {
  try {
    const { userId, prompt } = req.body;

    const user = await UserModel.findById(userId);

    if (!user || !prompt) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Details" });
    }

    if (user.creditBalance <= 0) {
      return res.json({
        success: false,
        message: "Insufficient Credits",
        creditBalance: user.creditBalance,
      });
    }

    const image = await generateImage1(prompt);

    await UserModel.findByIdAndUpdate(user._id, {
      creditBalance: user.creditBalance - 1,
    });

    res.status(200).json({
      success: true,
      message: "Image Generated",
      creditBalance: user.creditBalance - 1,
      image,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
