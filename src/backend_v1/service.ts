import { isMainThread, parentPort } from "worker_threads";

import { generateReport } from "./crawler";

if (!isMainThread) {
    parentPort?.on("message", async (event) => {
        await generateReport(event);
    });
}