
import cron from "node-cron";
import { Show } from "../models/showsModel.js";

export const startExpiredShowCleaner = () => {
  // ⏰ Runs every day at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("🧹 Running expired shows cleanup...");

    try {
      const today = new Date().toISOString().split("T")[0]; // format: YYYY-MM-DD

      const shows = await Show.find({});

      for (const show of shows) {
        const lastShowDate = show.dates?.[show.dates.length - 1]?.date;

        if (lastShowDate) {
          const formattedLastDate = new Date(lastShowDate)
            .toISOString()
            .split("T")[0];

          if (formattedLastDate < today) {
            await Show.findByIdAndDelete(show._id);
            console.log(`✅ Deleted expired show: ${show._id}`);
          }
        }
      }

      console.log("🎉 Expired shows cleanup completed.");
    } catch (err) {
      console.error("❌ Error during show cleanup:", err.message);
    }
  });
};
