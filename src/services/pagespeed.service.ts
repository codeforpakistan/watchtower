import axios from "axios";
import { config } from "../config/env";
import { pool } from "../config/db";
import pg from "pg";
import { store_websites } from "../database/website.query";
export const fetchPageSpeedData = async (url: string, retries = 3, delay = 2000): Promise<any> => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&key=${config.PAGESPEED_API_KEY}`,
      { timeout: 15000 } // Increase timeout to 15 seconds
    );

    const json = response.data;
    if (!json.lighthouseResult || !json.lighthouseResult.categories) {
      throw new Error("Invalid API response structure");
    }

    return {
      url: json.id,
      fetchTime: json.lighthouseResult.fetchTime,
      performanceScore: json.lighthouseResult.categories.performance?.score || 0,
      largest_contentful_paint:
        json.originLoadingExperience?.metrics?.["LARGEST_CONTENTFUL_PAINT_MS"]?.percentile / 1000 || 0,
      interaction_to_next_paint:
        json.originLoadingExperience?.metrics?.["INTERACTION_TO_NEXT_PAINT"]?.percentile / 1000 || 0,
      cumulative_shift_layout:
        json.lighthouseResult?.audits?.["cumulative-layout-shift"]?.score || 0,
      first_contentful_paint:
        json.originLoadingExperience?.metrics?.["FIRST_CONTENTFUL_PAINT_MS"]?.percentile / 1000 || 0,
      time_to_first_bite:
        json.originLoadingExperience?.metrics?.["EXPERIMENTAL_TIME_TO_FIRST_BYTE"]?.percentile / 1000 || 0,
      speed_index: json.lighthouseResult?.audits?.["speed-index"]?.numericValue / 1000 || 0,
      total_blocking_time:
        json.lighthouseResult?.audits?.["total-blocking-time"]?.numericValue / 1000 || 0,
    };
  } catch (error) {
    console.error(`Error fetching PageSpeed data for ${url}:`, error.message);

    if (retries > 0) {
      console.log(`Retrying ${url} in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchPageSpeedData(url, retries - 1, delay * 2); // Exponential backoff
    }

    throw new Error(`Failed to fetch website statistics after multiple attempts: ${url}`);
  }
};

import fetch from "node-fetch";

const API_KEY = process.env.SEARCH_API_KEY; 
const CX = process.env.CX; 
const query = "site:.gov.pk"; 
const MAX_PAGES = 40; 
const RESULTS_PER_PAGE = 10;
const client = new pg.Client({
  connectionString: config.DATABASE_URL,
});
export const searchAndStoreGovPkWebsites = async () => {
  const client = await pool.connect();
  let allWebsites = new Set<string>(); // Using Set to avoid duplicates

  for (let page = 0; page < MAX_PAGES; page++) {
    const startIndex = page * RESULTS_PER_PAGE + 1; // 1, 11, 21, ..., 91
    const url = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${API_KEY}&cx=${CX}&start=${startIndex}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!data.items) {
        console.log(`No results found on page ${page + 1}.`);
        break; // Stop if there are no more results
      }

      const websites = data.items.map((item: any) => {
        let hostname = new URL(item.link).hostname;
        return `https://${hostname}`; // Ensure "https://" is added
      });

      websites.forEach((site) => allWebsites.add(site));
    } catch (error) {
      console.error(`Error fetching page ${page + 1}:`, error);
      break; // Stop on error
    }
  }

  if (allWebsites.size === 0) {
    console.log("No new websites found.");
    return [];
  }

  const values = [...allWebsites].map((url) => `('${url}')`).join(", ");
  
  try {
    const result = await pool.query(store_websites(values));
    console.log(`Inserted ${result.rowCount} new websites.`);
    return result.rows.map((row) => row.id);
  } catch (error) {
    console.error("Error inserting websites:", error);
    throw error;
  } finally {
    client.release();
  }
};
