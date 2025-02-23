import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
export default connectDB;
// The connectDB function is an asynchronous function that connects to the MongoDB database using the MONGO_URI environment variable. If the connection is successful, it logs a message to the console. If there is an error, it logs the error message and exits the process with a status code of 1.
