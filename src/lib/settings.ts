
import categoriesConfig from '@/config/categories.json';
import type { SiteSettings } from './types';

async function fetchAndParseSheet(sheetUrl: string): Promise<any[]> {
    if (!sheetUrl) return [];
    try {
        const response = await fetch(sheetUrl, { next: { revalidate: 60 } }); // Revalidate every 60 seconds
        if (!response.ok) {
            console.error(`Failed to fetch sheet: ${response.statusText} for url: ${sheetUrl}`);
            return [];
        }
        const csv = await response.text();
        
        const lines = csv.split(/\r\n|\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        const dataRows = lines.slice(1);

        return dataRows.map(line => {
            // This regex handles commas inside quoted fields
            const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
            
            const rowObject: { [key: string]: string } = {};
            headers.forEach((header, index) => {
                 const value = (values[index] || '').trim();
                // Remove quotes from the beginning and end of the string
                rowObject[header] = value.replace(/^"|"$/g, '');
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
        let value: string | number | undefined = row.value;

        // Convert numeric strings to numbers for specific keys
        if (key === 'shippingInsideCity' || key === 'shippingOutsideCity') {
            if(value) {
                const numValue = parseFloat(value);
                value = isNaN(numValue) ? undefined : numValue;
            } else {
                 value = undefined;
            }
        }
        
        if (key) {
            acc[key] = value;
        }
        return acc;
    }, {} as SiteSettings);

    return settings;
}
