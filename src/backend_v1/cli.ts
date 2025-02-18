import fs from "fs";
import { Worker } from "worker_threads";

import readline from "readline";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { getSheetData } from "./sheets";

/**
 * Stop execution of program for the specified amount of time. This is
 * used to make sure that the API quota is not exceeded, which is roughly
 * around 4 requests per second.
 * @param milliseconds The amount of time to delay for.
 * @returns 
 */
function sleep(milliseconds: number): Promise<any> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

const maxWorkers: number = 15;
let workers: Worker[] = [];
let workersCreated: number = 0;

/**
 * Create a new worker thread if the maximum hasn't been reached, and have it generate the report.
 * If the maximum has been reached, the url is assigned to a random worker.
 * @param url The url given to the worker.
 */
async function createWorkerPool(urls: string[]) {
  for (let url of urls) {
    if (workersCreated < maxWorkers) {
      let worker = new Worker("src/service.ts");
      workers.push(worker);
      worker.postMessage(url);
      workersCreated++;
    } else {
      let randomWorker = workers[Math.floor(Math.random() * (workers.length - 1))]
      randomWorker.postMessage(url);
    }
    // Delay in order to stay within the quota limit.
    await sleep(250);
  }
}

yargs(hideBin(process.argv))
  .command(
    "generate <urls>",
    `Generate a report on the list of web pages in the specified file or spreadsheet.`,
    (yargs) => {
      yargs.positional("urls", {
        description: "The name of the file or spreadsheet containing the list of web pages to generate a report on",
        type: "string",
      }).option("range", {
        description: "A formula describing which row of the spreadsheet to access for generation of reports.",
        type: "string"
      })
    },
    async (argv: any) => {
      const name = argv.urls;
      const range = argv.range;
      if (!fs.existsSync(name)) { // A spreadsheet was passed as the argument.
        let entries: string[][] = [];
        try {
          entries = await getSheetData(name, range)
        } catch (err) {
          throw new Error(`Error: ${err}`)
        }

        createWorkerPool(entries.map(entry => entry[0]));
      } else {
        const fileStream = fs.createReadStream(name);

        const rl = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity,
        });

        let lines: string[] = [];
        rl.on("line", line => lines.push(line));

        rl.on("close", async () => createWorkerPool(lines));
      }
    }
  )
  .parse();
