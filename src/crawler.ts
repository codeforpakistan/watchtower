import fs from "fs";
import lighthouse, { type Flags } from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

export async function generateReport(url: string) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });

  const options: Flags = {
    logLevel: "info",
    output: "html",
    onlyCategories: ["performance"],
    port: chrome.port,
  };

  const runnerResult = await lighthouse(url, options);

  if (!runnerResult) {
    throw new Error("No report generated");
  }

  const reportHtml = runnerResult.report;

  if (!fs.existsSync("reports")) {
    fs.mkdirSync("reports");
  }

  const urlParts = url.split("/");
  const websiteName = urlParts[urlParts.length - 1];
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
