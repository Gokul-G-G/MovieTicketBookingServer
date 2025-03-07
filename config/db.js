import { connect } from "mongoose";
import { Admin } from "../models/adminModel.js";
import bcrypt from 'bcrypt'
const url = process.env.MONGO_URI

const insertAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: "admin@example.com" });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("securepassword123", 10);
      const admin = new Admin({
        name: "Admin",
        email: "admin@example.com",
        password: hashedPassword,
      });

      await admin.save();
      console.log("Admin user created successfully.");
    } else {
      console.log("Admin user already exists.");
    }
  } catch (error) {
    console.error("Error creating admin:", error);
  }
};

export const connectDB = async () => {
  try {
    const response = await connect(url);
    console.log('DB Connected Successfully')
    await insertAdmin();
  } catch (error) {
    console.log(error);
  }
};
