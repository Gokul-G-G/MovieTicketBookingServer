import { connect } from "mongoose";
import { Admin } from "../models/adminModel.js";
import bcrypt from 'bcrypt'
const url = process.env.MONGO_URI
const adminPassword = process.env.ADMIN_PWD;
const insertAdmin = async () => {
  try {
    //check admin exist on DB
    const adminExists = await Admin.findOne({ email: "admin@example.com" });
    //If not exist create admin use the details
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const admin = new Admin({
        name: "Admin",
        email: "admin@example.com",
        password: hashedPassword,
      });
    //save admin data to DB
      await admin.save();
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
