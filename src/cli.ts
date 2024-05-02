import fs from "fs";
import readline from "readline";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { generateReport } from "./crawler";

yargs(hideBin(process.argv))
  .command(
    "generate <filename>",
    `Generate a report on the list of web pages in the specified file`,
    (yargs) =>
      yargs.positional("filename", {
        description:
          "The name of the file containing the list of web pages to generate a report on",
        type: "string",
      }),
    (argv: any) => {
      const filename = argv.filename;
      
      if (!fs.existsSync(filename)) {
        throw new Error("File does not exist");
      }

      const fileStream = fs.createReadStream(filename);

      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      let lines: string[] = [];

      rl.on("line", (line) => {
        lines.push(line);
      });

      rl.on("close", async () => {
        for (let line of lines) {
          await generateReport(line);
        }
      });
    }
  )
  .parse();
