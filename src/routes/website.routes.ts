import { Elysia } from "elysia";
import { fetchAndStoreWebsiteStats, get_states } from "../controller/website.controller";
import cron from "node-cron";
const router = new Elysia();

router.post("/store-stats", async () => {
  await   fetchAndStoreWebsiteStats();
  return { message: "Response Stored Successfully." };
});

router.get("/get-stats", async () => {
    return   get_states();
    return { message: "Response Stord Successfully." };
  });
  // Monthly cron job
  cron.schedule("0 0 1 * *", async () => {
    console.log("Running monthly PageSpeed insights update...");
    await fetchAndStoreWebsiteStats();
    console.log("Monthly update completed.");
  });

export default router;

