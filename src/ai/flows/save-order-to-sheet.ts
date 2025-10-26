
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { siteConfig } from '@/config/site';

export const SaveOrderInputSchema = z.object({
  customerName: z.string().describe("Customer's full name"),
  customerPhone: z.string().describe("Customer's phone number"),
  customerAddress: z.string().describe("Customer's full shipping address"),
  orderItems: z.string().describe("A comma-separated string of items in the order"),
  orderTotal: z.string().describe("The total cost of the order"),
});

export type SaveOrderInput = z.infer<typeof SaveOrderInputSchema>;

export async function saveOrderToSheet(input: SaveOrderInput): Promise<void> {
  return saveOrderToSheetFlow(input);
}

const saveOrderToSheetFlow = ai.defineFlow(
  {
    name: 'saveOrderToSheetFlow',
    inputSchema: SaveOrderToSheetInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    const sheetUrl = siteConfig.checkout.sheetUrl;

    if (!sheetUrl || sheetUrl === 'YOUR_GOOGLE_SHEET_APPS_SCRIPT_URL_HERE') {
      console.error("Google Sheet URL is not configured in src/config/checkout.json");
      throw new Error(
        `Please configure the Google Sheet URL in src/config/checkout.json to save orders. 
        
You need to create a Google Sheet, then go to Extensions > Apps Script, paste the provided script, deploy it as a web app, and then copy the web app URL into the checkout.json file.

Here is the Apps Script code to use:
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var newRow = headers.map(function(header) {
    if (header === "Date") {
      return new Date();
    }
    return data[header] || ""; 
  });
  
  sheet.appendRow(newRow);
  
  return ContentService.createTextOutput(JSON.stringify({ "status": "success" })).setMimeType(ContentService.MimeType.JSON);
}
`
      );
    }

    try {
      const response = await fetch(sheetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "Name": input.customerName,
          "Phone": input.customerPhone,
          "Address": input.customerAddress,
          "Order Items": input.orderItems,
          "Total": input.orderTotal,
        }),
        // Apps Script's doPost requires a redirect to be handled manually
        redirect: 'follow', 
      });
      
      // Handle Apps Script's HTML response on redirect
      if (response.headers.get('Content-Type')?.includes('text/html')) {
        const textResponse = await response.text();
        if (textResponse.includes('The script completed but did not return anything.')) {
            console.log('Order saved to Google Sheet successfully (via redirect).');
            return;
        }
      }

      const jsonResponse = await response.json();
      
      if (jsonResponse.status !== 'success') {
        throw new Error('Failed to save order to Google Sheet. The script did not return a success status.');
      }

      console.log('Order saved to Google Sheet successfully');
      
    } catch (error) {
      console.error('Error saving order to Google Sheet:', error);
      throw new Error('An error occurred while saving the order.');
    }
  }
);
