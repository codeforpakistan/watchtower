import "dotenv/config";

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
    key: process.env.API_KEY
  };

  return `${api}?url=${options.url}&key=${options.key}`;
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

  try {
    const response = await fetch(apiEndpoint);
    const json: any = await response.json();

    const performanceScore = json.lighthouseResult.categories.performance.score;



    console.log(`Performance score for ${url} is`, performanceScore);

    return performanceScore;
  } catch (err) {
    console.error(`No report generated for ${url} with ${err}.`);
    return -1;
  }
}
