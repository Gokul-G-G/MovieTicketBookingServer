import mongoose, { Schema } from "mongoose";

const adminSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 30,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    role: {
      type: String,
      required: true,
      default: "admin",
      immutable: true, // Prevents modification of the role
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent modifications to the role after creation
adminSchema.pre("save", function (next) {
  if (this.role !== "admin") {
    this.role = "admin"; // Force role to stay as admin
  }
  next();
});

export const Admin = mongoose.model("Admin", adminSchema);
