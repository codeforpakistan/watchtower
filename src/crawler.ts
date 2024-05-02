import fs from "fs";
import lighthouse, { type Flags } from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const DEFAULT_OPTIONS: Flags = {
  logLevel: "info",
  output: "html",
  onlyCategories: ["performance"],
};

/**
 * Generates a Lighthouse report with configurable options.
 * @param {string} url - The url to generate the report against.
 * @param {Flags} options - The options to configure Lighthouse with.
 */
export async function generateReport(url: string, options: Flags = DEFAULT_OPTIONS) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });

  const opts: Flags = {
    ...options,
    port: chrome.port,
  };

  const runnerResult = await lighthouse(url, opts);

  if (!runnerResult) {
    throw new Error("No report generated");
  }

  const reportHtml = runnerResult.report;

  if (!fs.existsSync("reports")) {
    fs.mkdirSync("reports");
  }

  // Note that this creates a unique directory for each domain and subdomain, but not the same pages.
  const websiteName = new URL(url).hostname;
  if (!fs.existsSync(`reports/${websiteName}`)) {
    fs.mkdirSync(`reports/${websiteName}`);
  }


  fs.writeFileSync(`reports/${websiteName}/report.html`, reportHtml.toString());

  console.log("Report is done for", runnerResult.lhr.finalDisplayedUrl);

  if (!runnerResult.lhr.categories.performance.score) {
    throw new Error("No performance score found");
  }

  console.log(
    "Performance score was",
    runnerResult.lhr.categories.performance.score * 100
  );

  await chrome.kill();
}
