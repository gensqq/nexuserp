import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.file"];

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || "http://localhost:3001/api/settings/google/callback"
  );
}

export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
}

export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function getSheetsClient(accessToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.sheets({ version: "v4", auth: oauth2Client });
}

export async function createSpreadsheet(accessToken: string, title: string, headers: string[], sheetName?: string) {
  const sheets = await getSheetsClient(accessToken);
  const tabName = sheetName || "Data";

  const response = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title },
      sheets: [{
        properties: { title: tabName },
      }],
    },
  });

  const spreadsheetId = response.data.spreadsheetId!;

  // Write headers
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tabName}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: [headers] },
  });

  return { spreadsheetId, url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}` };
}

export async function writeRows(accessToken: string, spreadsheetId: string, sheetName: string, rows: any[][]) {
  const sheets = await getSheetsClient(accessToken);

  // Check if sheet exists, create if not
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetExists = spreadsheet.data.sheets?.some(
    (s) => s.properties?.title === sheetName
  );

  if (!sheetExists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: sheetName } } }],
      },
    });
  }

  // Clear existing data
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${sheetName}!A:ZZ`,
  });

  // Write new data
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: rows },
  });
}

export async function readRows(accessToken: string, spreadsheetId: string, sheetName: string) {
  const sheets = await getSheetsClient(accessToken);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:ZZ`,
  });

  return response.data.values || [];
}

export const SHEET_CONFIGS: Record<string, { title: string; headers: string[] }> = {
  products: {
    title: "Products",
    headers: ["ID", "Name", "SKU", "Category", "Price", "Cost", "Stock", "Min Stock", "Active"],
  },
  customers: {
    title: "Customers",
    headers: ["ID", "Name", "Email", "Phone", "City", "Country", "Status", "Source"],
  },
  employees: {
    title: "Employees",
    headers: ["ID", "Employee ID", "First Name", "Last Name", "Email", "Department", "Position", "Salary", "Status"],
  },
  suppliers: {
    title: "Suppliers",
    headers: ["ID", "Name", "Email", "Phone", "Address", "Active"],
  },
  expenses: {
    title: "Expenses",
    headers: ["ID", "Date", "Category", "Description", "Amount", "Vendor", "Status"],
  },
  orders: {
    title: "Orders",
    headers: ["ID", "Order Number", "Customer", "Status", "Subtotal", "Tax", "Total", "Payment Method", "Date"],
  },
};
