import "dotenv/config";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { writeFile } from 'fs/promises';


// Firebase configuration (replace with your own config)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FB_PROJECT_ID,
  storageBucket: process.env.FB_STORAGEBUCKET,
  messagingSenderId: process.env.FB_MESSAGINGSENDERID,
  appId: process.env.FB_APPID,
  measurementId: process.env.FB_MEASUREMENTID
};


// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to store performance data
async function storePerformanceData(url: string, performanceData: any) {
  try {
    const docRef = await addDoc(collection(db, "performanceData"), {
      url: url,
      ...performanceData,
      timestamp: new Date()
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}


/**
 * Access rthe URL and check if it is accessible.
 * @param url The URL to check.
 * @returns true or false based on the accessibility of the URL.
 */
async function checkUrlAccessibility(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok; // Returns true if the status code is between 200-299
  } catch (error) {
    console.error(`Error accessing URL ${url}:`, error);
    return false;
  }
}


/**
 * Create a query url for the PageSpeeds Insights API.
 * @param url The url to query the api for.
 * @returns A query url that can be fetched to get the results. 
 */
function createQuery(url: string): string {
  let api = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
  let options: any = {
    url: encodeURIComponent(url),
    key: process.env.API_KEY,
    strategy: "mobile"
  };

  return `${api}?url=${options.url}&key=${options.key}&strategy=${options.strategy}`;
}


/**
 * Generates a Lighthouse report using PageSpeed Insights API.
 * @param {string} url - The url to generate the report against.
 */
export async function generateReport(url: string): Promise<number> {


  const isAccessible = await checkUrlAccessibility(url);
  if (!isAccessible) {
    // console.error(`URL ${url} is not accessible. Skipping PageSpeed Insights API call.`);
    return -1;
  }

  const apiEndpoint =  createQuery(url)

  console.log(`Generating report for ${url}.`);
  console.log(`API endpoint: ${apiEndpoint}`);

  try {
    console.log("Waiting for 3 seconds before fetching the report.");
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log("Fetching the report now.");
    const response = await fetch(apiEndpoint);
    const json: any = await response.json();

    const performanceScore = json.lighthouseResult.categories.performance.score;
    const responseTime = json.loadingExperience.metrics.EXPERIMENTAL_TIME_TO_FIRST_BYTE.percentile;

    var performance = {
      "performanceScore": performanceScore,
      "responseTime": responseTime
    }

    // Store the performance data in Firestore
    await storePerformanceData(url, performance);

    
    // // Access the accessibility score
    // const accessibilityScore = json.lighthouseResult.categories.accessibility.score;
 
    // // Access the best practices score
    // const bestPracticesScore = json.lighthouseResult.categories["best-practices"].score;

    // // Access the SEO score
    // const seoScore = json.lighthouseResult.categories.seo.score;


    console.log(`Performance score for ${url} is`, performanceScore);
    console.log(`Response time for ${url} is`, responseTime/1000);
    // console.log(`Accessibility score for ${url} is`, accessibilityScore);
    // console.log(`Best practices score for ${url} is`, bestPracticesScore);
    // console.log(`SEO score for ${url} is`, seoScore);

    return performanceScore;
  } catch (err) {
    console.error(`No report generated for ${url} with ${err}.`);
    return -1;
  }
}
