
import type { Product, ProductCategory } from './types';
import categoriesConfig from '@/config/categories.json';

// A more robust CSV parser that handles quoted fields.
function parseCSV(csv: string): string[][] {
    const lines = csv.replace(/\r/g, '').split('\n');
    return lines.map(line => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    });
}

async function fetchAndParseSheet(sheetUrl: string): Promise<Product[]> {
    if (!sheetUrl) return [];
    try {
        // Using `no-store` to prevent caching issues that might cause intermittent data loading failures.
        const response = await fetch(sheetUrl, { cache: 'no-store' });
        if (!response.ok) {
            console.error(`Failed to fetch sheet: ${response.statusText} for url: ${sheetUrl}`);
            return [];
        }
        const csv = await response.text();
        const lines = parseCSV(csv);
        
        if (lines.length < 2) return [];

        const headers = lines[0];
        const headerMap: { [key: string]: number } = {};
        headers.forEach((header, index) => {
            headerMap[header.trim()] = index;
        });

        // Check for essential columns
        const requiredColumns = ['id', 'name', 'price', 'imageUrl'];
        for (const col of requiredColumns) {
            if (headerMap[col] === undefined) {
                console.error(`Missing required column in Google Sheet: ${col}`);
                return [];
            }
        }

        const dataRows = lines.slice(1);

        return dataRows.map(values => {
            if (values.length < headers.length || values.every(v => v === '')) return null;

            const id = values[headerMap['id']];
            const name = values[headerMap['name']];
            const price = parseFloat(values[headerMap['price']]);
            const imageUrl = values[headerMap['imageUrl']];

            if (!id || !name || isNaN(price) || !imageUrl) {
                return null;
            }

            const category = values[headerMap['category']] || 'Products';

            const product: Product = {
                id,
                name,
                description: values[headerMap['description']] || '',
                price,
                category: category as ProductCategory,
                unit: values[headerMap['unit']] || undefined,
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
        console.error(`Error in fetchAndParseSheet for ${sheetUrl}:`, error);
        return [];
    }
}


async function initializeProducts(): Promise<Product[]> {
    const fetchPromises = categoriesConfig.productCategories.map(category => fetchAndParseSheet(category.sheetUrl));
    
    try {
        const productArrays = await Promise.all(fetchPromises);
        const allProducts = productArrays.flat();
        
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
