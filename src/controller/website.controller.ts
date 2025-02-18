import { get_stats_q, get_websites, store_website_stats } from "../database/website.query";
import { fetchPageSpeedData, searchAndStoreGovPkWebsites  } from "../services/pagespeed.service";
import pg from "pg";
import { config } from "../config/env";
import CircularJSON from "circular-json";
import NodeCache from "node-cache";
import { pool } from "../config/db";
const cache = new NodeCache({ stdTTL: 0 });
const client = new pg.Client({
  connectionString: config.DATABASE_URL,
});
export const fetchAndStoreWebsiteStats = async () => {
  try {
    const client = await pool.connect();
    const pksites = await searchAndStoreGovPkWebsites();
    const query = get_websites();
    const websites = await client.query(query);

    const batchSize = 5; // Limit concurrent requests
    const websiteBatches = chunkArray(websites.rows, batchSize);

    for (const batch of websiteBatches) {
      await Promise.allSettled(
        batch.map(async (website) => {
          try {
            const stats = await fetchPageSpeedData(website.url);
            await client.query(store_website_stats(website.id, stats));
            console.log(`Successfully stored stats for: ${website.url}`);
          } catch (innerError) {
            console.error(`Failed to process ${website.url}:`, innerError);
          }
        })
      );
      console.log("Batch processed. Waiting before next batch...");
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Add a delay between batches
    }

    return true;
  } catch (error) {
    console.error("Error fetching and storing stats:", error);
  }
};

// Helper function to split websites into batches
function chunkArray(array, size) {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

  export const get_states = async (param: Param) => {
    try {
      const client = await pool.connect(); 
      const query = get_stats_q(param);
      const stats = await client.query(query);
      if (stats.rows.length > 0) {
        
        const parsedStats = stats.rows.map(row => {
          return {
            ...row,
            stats: row.stats
          };
        });

        return parsedStats;
      } else {
        console.log("No data found");
        return [];
      }
    } catch (error) {
      console.error("Error fetching and storing stats:", error);
      return { message: "Error fetching stats", error: error.message };
    } finally {
      await client.end(); // Make sure to close the client connection
    }
  };
