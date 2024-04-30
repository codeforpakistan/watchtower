# Watchtower - Analyzing Government Websites

## Project Overview

Watchtower is a project aimed at continuously analyzing the quality and performance of government websites using Google's Lighthouse tool. The goal is to compile a report that provides an ongoing assessment of these websites, highlighting how they evolve and improve over time. By doing this, we aim to foster better digital governance and transparency.

## Features

Crawl a predefined list of government websites.
Utilize Lighthouse to analyze the front pages of these websites.
Generate reports with performance scores.
Store and compare historical data to track changes and improvements.
Publish an annual analysis on the state of digital governance.

## Technology Stack

- Bun: For backend operations.
- Google Lighthouse: To perform website analyses.
- Google Sheets API: To store and manage the data.

## Getting Started

To get started with Watchtower:

- Clone the repository.
- Ensure you have [`Bun`](https://bun.sh/) installed on your machine.
- Install dependencies: `bun install`
- Set up Google API credentials (see documentation).
- Head over the the `./node_modules/lighthouse/core/lib/page-functions.js` file and replace the `getRuntimeFunctionName` function with the following code:

```javascript
function getRuntimeFunctionName(fn) {
  if (!fn.name) throw new Error(`could not find function name for: ${fn}`);
  return fn.name;
}
```

Bun seems to elide function names expected by Lighthouse, which causes the crawler to crash. This current implementation uses the function's name property to get the function name, which fixes the issue.

- Run the crawler: `bun run index.ts --help`


## Contributing

Contributions are welcome! Please read our CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
