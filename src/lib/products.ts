
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
                values.push(currentField);
                currentField = '';
            } else {
                currentField += char;
            }
        }
        values.push(currentField); // Add the last field
        result.push(values.map(v => v.trim()));
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
        const requiredColumns = ['Name', 'Price', 'Thumbnail'];
        for (const col of requiredColumns) {
            if (headerMap[col] === undefined) {
                console.error(`Missing required column in Google Sheet: ${col}`);
                return [];
            }
        }

        return dataRows.map((values) => {
            if (values.length < headers.length) return null; // Skip malformed rows
            
            const name = values[headerMap['Name']];
            const price = parseFloat(values[headerMap['Price']]);
            const thumbnail = values[headerMap['Thumbnail']];

            // Basic validation: name, price and a valid thumbnail URL are required
            if (!name || isNaN(price) || !thumbnail) {
                return null;
            }
             try {
                new URL(thumbnail); // Validate URL
            } catch (e) {
                console.warn(`Invalid thumbnail URL for product '${name}': ${thumbnail}`);
                return null; // Skip products with invalid thumbnail URLs
            }

            const category = values[headerMap['Category']] || 'Products';
            const brand = values[headerMap['Brand']];
            const productId = `${name.replace(/\s+/g, '-').toLowerCase()}-${(brand || category || 'item').replace(/\s+/g, '-').toLowerCase()}`;

             const product: Product = {
                id: productId,
                name: name,
                description: values[headerMap['Description']] || '',
                price: price,
                category: (category as any),
                image: {
                    id: `${productId}-img`,
                    src: thumbnail,
                    alt: name,
                    hint: values[headerMap['Tag']] || category,
                },
                gallery: [values[headerMap['Image1']], values[headerMap['Image2']]].filter(Boolean),
                colors: values[headerMap['Color']] ? values[headerMap['Color']].split(',').map(c => c.trim()) : undefined,
                sizes: values[headerMap['Size']] ? values[headerMap['Size']].split(',').map(s => s.trim()) : undefined,
                brand: brand,
                tags: values[headerMap['Tag']] ? values[headerMap['Tag']].split(',').map(t => t.trim()) : undefined,
                stock: parseInt(values[headerMap['Stock']], 10) || 0,
                availability: values[headerMap['Availability']],
            };

            return product;
        }).filter((p): p is Product => p !== null);

    } catch (error) {
        console.error(`Failed to fetch or parse sheet: ${sheetUrl}`, error);
        return [];
    }
}


let productsCache: Product[] | null = null;

async function initializeProducts(): Promise<Product[]> {
    if (productsCache) {
        return productsCache;
    }

    const fetchPromises = categories.map(category => fetchAndParseSheet(category.sheetUrl));
    
    try {
        const productArrays = await Promise.all(fetchPromises);
        const allProducts = productArrays.flat();
        
        // Simple deduplication based on a generated ID
        const uniqueProducts = Array.from(new Map(allProducts.map(p => [p.id, p])).values());
        
        productsCache = uniqueProducts;
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
