import { sheets, sheets_v4 } from "@googleapis/sheets";
import { authenticate } from "@google-cloud/local-auth";
import { OAuth2Client } from 'google-auth-library';
import {google} from 'googleapis';

const sheetsModule: sheets_v4.Sheets = sheets("v4");

let auth: OAuth2Client | JSONClient | Compute | null = null;

/**
 * Perform authentication using the key file and return an instance of the client.
 * 
 * This function will only perform the authentication once every time the CLI is run if needed.
 */
async function getOAuth2Token(): Promise<OAuth2Client> {
  if (auth == null) {
    const googleAuth = new google.auth.GoogleAuth({
      keyFilename: "oauth2.keys.json",
      scopes: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/spreadsheets",
      ],
    });

    auth = await googleAuth.getClient();
  }

  return auth;
}

/**
 * Append some data values to a certain spreadsheet with a given range.
 * @param {string} spreadsheetId - The id of the spreadsheet we want to append to.
 * @param {string} range - The sheet and cells in the spreadsheet that we want to append to. For example,
 * the range 'Scores!A2:B' means accessing the Scores sheet, from cell A2 to B.
 * @param {any[][]} values - The values that we want to append to the spreadsheet at the specified range.
 * This is a list of lists, corresponding to first the row and then the cells.
 */
export async function appendToSheet(spreadsheetId: string, range: string, values: any[][]) {
  const auth = await getOAuth2Token();

  await sheetsModule.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

/**
 * Read data from a certain spreadsheet with a given range.
 * @param {string} spreadsheetId - The id of the spreadsheet we want to read from.
 * @param {string} range - The sheet and cells in the spreadsheet that we want to append to. For example,
 * the range 'Scores!A2:B' means accessing the Scores sheet, from cell A2 to B.
 */
export async function getSheetData(spreadsheetId: string, range: string): Promise<any[][]> {
  const auth = await getOAuth2Token();

  const results = await sheetsModule.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range,
  });

  if (results.data.values != null) {
    return results.data.values
  }

  return []
}