import "dotenv/config";

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
  console.log(`Generating report for ${url}.`);
  await fetch(createQuery(url))
    .then(response => response.json())
    .then((json: any) => {
      let score: number = json.lighthouseResult.categories.performance.score;
      console.log(`Performance score for ${url} is`, Math.round(score * 100));
      return score;
    })
    .catch(err => { console.error(`No report generated for ${url}.`) });

    return -1;
}
