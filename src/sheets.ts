import { sheets, sheets_v4 } from "@googleapis/sheets";
import { authenticate } from "@google-cloud/local-auth";

const sheetsModule: sheets_v4.Sheets = sheets("v4");

/**
 * Append some data values to a certain spreadsheet with a given range.
 * @param {string} spreadsheetId - The Id of the spreadsheet we want to append to.
 * @param {string} range - The sheet and cells in the spreadsheet that we want to append to. For example,
 * the range 'Scores!A2:B' means accessing the Scores sheet, from cell A2 to B.
 * @param {any[][]} values - The values that we want to append to the spreadsheet at the specified range.
 * This is a list of lists, corresponding to first the row and then the cells.
 */
export async function appendToSheet(spreadsheetId: string, range: string, values: object) {
  const auth = await authenticate({
    // This file must be downloaded from the google cloud workspace. As the goals are to read and write from a specific
    // spreadsheet only, it will be replaced with a service account later.
    keyfilePath: "oauth2.keys.json",
    // Scopes include the ability to modify spreadsheets, as well as being able to access Google Drive files for spreadsheets.
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  // Typescript shows a type error here, however from what I can tell the code is correct and follows the object typings.
  // The code runs as normal as well.
  const results = await sheetsModule.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}