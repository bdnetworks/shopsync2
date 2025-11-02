
import type { Product } from './types';
import categories from '@/config/categories.json';

// A more robust CSV parser that handles quoted fields and commas within fields.
function parseCSV(csv: string): string[][] {
    const lines = csv.split('\n');
    const result: string[][] = [];
    for (const line of lines) {
        if (!line.trim()) continue;
        
        const values: string[] = [];
        let currentField = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                // If the next character is also a quote, it's an escaped quote
                if (inQuotes && line[i+1] === '"') {
                    currentField += '"';
                    i++; // Skip the next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(currentField.trim());
                currentField = '';
            } else {
                currentField += char;
            }
        }
        values.push(currentField.trim()); // Add the last field
        result.push(values);
    }
    return result;
}


async function fetchAndParseSheet(sheetUrl: string): Promise<Product[]> {
     if (!sheetUrl) return [];
    try {
        const response = await fetch(sheetUrl, { next: { revalidate: 5 } }); // Revalidate every 5 seconds
        if (!response.ok) {
            console.error(`Failed to fetch sheet: ${response.statusText} for url: ${sheetUrl}`);
            return [];
        }
        const csv = await response.text();
        const lines = parseCSV(csv);
        
        if (lines.length < 2) return []; // Should have header and at least one data row

        const headers = lines[0].map(h => h.trim());
        const dataRows = lines.slice(1);

        // Map headers to their indices
        const headerMap: { [key: string]: number } = {};
        headers.forEach((header, index) => {
            headerMap[header] = index;
        });

        // Check for essential columns
        const requiredColumns = ['id', 'name', 'price', 'imageUrl'];
        for (const col of requiredColumns) {
            if (headerMap[col] === undefined) {
                console.error(`Missing required column in Google Sheet: ${col}`);
                return [];
            }
        }

        return dataRows.map((values) => {
            if (values.length < headers.length) return null; // Skip malformed rows
            
            const id = values[headerMap['id']];
            const name = values[headerMap['name']];
            const price = parseFloat(values[headerMap['price']]);
            const imageUrl = values[headerMap['imageUrl']];

            // Basic validation: id, name, price and a valid imageUrl are required
            if (!id || !name || isNaN(price) || !imageUrl) {
                return null;
            }
             try {
                new URL(imageUrl); // Validate URL
            } catch (e) {
                console.warn(`Invalid imageUrl for product '${name}': ${imageUrl}`);
                return null; // Skip products with invalid image URLs
            }

            const category = values[headerMap['category']] || 'Products';

             const product: Product = {
                id: id,
                name: name,
                description: values[headerMap['description']] || '',
                price: price,
                category: (category as any),
                unit: values[headerMap['unit']],
                image: {
                    id: `${id}-img`,
                    src: imageUrl,
                    alt: values[headerMap['imageAlt']] || name,
                    hint: values[headerMap['imageHint']] || category,
                },
                colors: values[headerMap['colors']] ? values[headerMap['colors']].split(',').map(c => c.trim()) : undefined,
                sizes: values[headerMap['sizes']] ? values[headerMap['sizes']].split(',').map(s => s.trim()) : undefined,
            };

            return product;
        }).filter((p): p is Product => p !== null);

    } catch (error) {
        console.error(`Failed to fetch or parse sheet: ${sheetUrl}`, error);
        return [];
    }
}


async function initializeProducts(): Promise<Product[]> {
    const fetchPromises = categories.map(category => fetchAndParseSheet(category.sheetUrl));
    
    try {
        const productArrays = await Promise.all(fetchPromises);
        const allProducts = productArrays.flat();
        
        // Simple deduplication based on a generated ID
        const uniqueProducts = Array.from(new Map(allProducts.map(p => [p.id, p])).values());
        
        return uniqueProducts;

    } catch (error) {
        console.error("Failed to initialize products from Google Sheets.", error);
        return [];
    }
}


export const getProducts = async (): Promise<Product[]> => {
    return initializeProducts();
}

export const getProductById = async (id: string): Promise<Product | undefined> => {
    const products = await getProducts();
    return products.find(p => p.id === id);
}
