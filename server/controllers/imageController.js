import User from "../models/User.js";
import { generateImage1 } from "../utils/generateChatgptImage.js";

export const generateImage = async (req, res) => {
  try {
    const { userId, prompt } = req.body;

    const user = await User.findById(userId);

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

    let image;
    try {
      image = await generateImage1(prompt);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Image generation failed",
        error: error.message,
      });
    }

    // Deduct 1 credit safely
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $inc: { creditBalance: -1 } }, // Atomically decrement creditBalance
      { new: true } // Return updated document
    );

    res.status(200).json({
      success: true,
      message: "Image Generated",
      creditBalance: updatedUser.creditBalance,
      image,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
