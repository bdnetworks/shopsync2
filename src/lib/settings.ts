
import categoriesConfig from '@/config/categories.json';
import type { SiteSettings } from './types';

function parseCSV(csv: string): string[][] {
    const lines: string[][] = [];
    if (!csv) return lines;

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
                if (char === '"') {
                    if (i + 1 < row.length && row[i + 1] === '"') {
                        field += '"';
                        i++; // Skip next quote
                    } else {
                        inQuotedField = false;
                    }
                } else {
                    field += char;
                }
            } else {
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

async function fetchAndParseSheet(sheetUrl: string): Promise<{ [key: string]: string }[]> {
    if (!sheetUrl || sheetUrl.includes('YOUR_')) return [];
    try {
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
                rowObject[header] = values[index] || '';
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
        const key = row.key?.trim();
        const value = row.value?.trim();
        
        if (key && value) {
            acc[key] = value;
        }
        return acc;
    }, {} as SiteSettings);

    return settings;
}
