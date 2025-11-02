
import categoriesConfig from '@/config/categories.json';
import type { SiteSettings } from './types';

async function fetchAndParseSheet(sheetUrl: string): Promise<any[]> {
    if (!sheetUrl) return [];
    try {
        const response = await fetch(sheetUrl, { next: { revalidate: 3600 } }); // Revalidate every hour
        if (!response.ok) {
            console.error(`Failed to fetch sheet: ${response.statusText} for url: ${sheetUrl}`);
            return [];
        }
        const csv = await response.text();
        
        const lines = csv.split(/\r\n|\n/);
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        const dataRows = lines.slice(1);

        return dataRows.map(line => {
            const values = line.split(',');
            const rowObject: { [key: string]: string } = {};
            headers.forEach((header, index) => {
                rowObject[header] = values[index] ? values[index].trim() : '';
            });
            return rowObject;
        }).filter(row => row.key && row.value); // Ensure only rows with key and value are processed

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
        let value: string | number = row.value;

        // Convert numeric strings to numbers for specific keys
        if (key === 'shippingInsideCity' || key === 'shippingOutsideCity') {
            value = parseFloat(value);
            if (isNaN(value)) {
                console.warn(`Invalid number format for ${key}: ${row.value}`);
                return acc;
            }
        }
        
        if (key) {
            acc[key] = value;
        }
        return acc;
    }, {} as SiteSettings);

    return settings;
}
