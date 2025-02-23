import fs from "fs";
import axios from "axios";
import FormData from "form-data";

const API_KEY = process.env.API_KEY; // 🔹 Replace with your actual API key

export const generateImage1 = async (prompt) => {
  const payload = {
    prompt: prompt,
    output_format: "webp",
  };

  const form = new FormData();
  for (const key in payload) {
    form.append(key, payload[key]);
  }

  try {
    const response = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/generate/core", // 🔹 Correct API URL
      form,
      {
        validateStatus: undefined,
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Accept: "image/*",
          ...form.getHeaders(),
        },
      }
    );

    if (response.status === 200) {
      const base64Image = Buffer.from(response.data, "binary").toString(
        "base64"
      );
      const resultImage = `data:image/png;base64,${base64Image}`;
      // const filePath = "./lighthouse.webp";
      // fs.writeFileSync(filePath, Buffer.from(response.data));
      // console.log(`✅ Image saved as ${filePath}`);
      // return filePath; // Return the saved image path
      return resultImage;
    } else {
      throw new Error(`${response.status}: ${response.data.toString()}`);
    }
  } catch (error) {
    console.error(
      "❌ Error generating image:",
      error.response?.data?.toString() || error.message
    );
    throw error;
  }
};
