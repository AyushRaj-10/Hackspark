// config/db.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.set('strictQuery', true); // Recommended Mongoose setting
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected successfully.");
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;