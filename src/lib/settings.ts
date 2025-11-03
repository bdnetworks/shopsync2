
import categoriesConfig from '@/config/categories.json';
import type { SiteSettings } from './types';

function parseCSV(csv: string): string[][] {
    const lines: string[][] = [];
    if (!csv) return lines;

    // Normalize line endings
    const csvNormalized = csv.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const rows = csvNormalized.split('\n');

    for (const row of rows) {
        if (!row.trim()) continue; // Skip empty lines

        const line: string[] = [];
        let field = '';
        let inQuotedField = false;

        for (let i = 0; i < row.length; i++) {
            const char = row[i];

            if (inQuotedField) {
                // If the character is a quote
                if (char === '"') {
                    // Check if it's an escaped quote (two quotes in a row)
                    if (i + 1 < row.length && row[i + 1] === '"') {
                        field += '"';
                        i++; // Skip the next quote
                    } else {
                        // It's the end of the quoted field
                        inQuotedField = false;
                    }
                } else {
                    // It's a normal character inside a quoted field
                    field += char;
                }
            } else {
                // If we are not in a quoted field
                if (char === '"') {
                    inQuotedField = true;
                } else if (char === ',') {
                    line.push(field.trim());
                    field = '';
                } else {
                    field += char;
                }
            }
        }
        line.push(field.trim());
        lines.push(line);
    }
    return lines;
}

async function fetchAndParseSheet(sheetUrl: string): Promise<any[]> {
    if (!sheetUrl || sheetUrl.includes('YOUR_')) return [];
    try {
        // Revalidate every time for now to ensure fresh data.
        const response = await fetch(sheetUrl, { cache: 'no-store' }); 
        if (!response.ok) {
            console.error(`Failed to fetch sheet: ${response.statusText} for url: ${sheetUrl}`);
            return [];
        }
        const csv = await response.text();
        
        const lines = parseCSV(csv);
        if (lines.length < 2) return [];

        const headers = lines[0].map(h => h.trim().toLowerCase());
        const dataRows = lines.slice(1);

        return dataRows.map(values => {
            if (values.every(v => v === '')) return null;

            const rowObject: { [key: string]: string } = {};
            headers.forEach((header, index) => {
                 const value = values[index] || '';
                rowObject[header] = value;
            });
            return rowObject;

        }).filter(row => row && typeof row === 'object' && ('key' in row) && ('value' in row) && row.key);

    } catch (error) {
        console.error(`Error in fetchAndParseSheet for ${sheetUrl}:`, error);
        return [];
    }
}

export async function getSiteSettings(): Promise<SiteSettings> {
    const settingsUrl = categoriesConfig.settingsSheetUrl;
    if (!settingsUrl) {
        console.warn("Settings sheet URL is not configured.");
        return {};
    }

    const rows = await fetchAndParseSheet(settingsUrl);
    
    const settings: SiteSettings = rows.reduce((acc, row) => {
        const key = row.key;
        let value: string | number | undefined = row.value;
        
        if (key) {
            acc[key] = value;
        }
        return acc;
    }, {} as SiteSettings);

    return settings;
}
