import { Notification } from "../models/notificationModel.js";

// Function to notify admin by saving request in the database
export const notifyAdmin = async (newtheaterOwner) => {
  try {
    const newNotification = new Notification({
      type: "TheaterOwnerSignup",
      message: `New Theater Owner Signup: ${newtheaterOwner.name} (${newtheaterOwner.email})`,
      ownerId: newtheaterOwner._id,
      isRead: false, // Mark as unread for admin
    });

    await newNotification.save();
    // console.log("New theater owner request saved for admin notification.");
  } catch (error) {
    console.error("Error notifying admin:", error);
  }
};
