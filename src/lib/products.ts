
import type { Product, ProductCategory, FeaturedSection, TopCategory } from './types';
import categoriesConfig from '@/config/categories.json';

// A more robust CSV parser that handles quoted fields.
function parseCSV(csv: string): string[][] {
    const lines: string[][] = [];
    let currentLine: string[] = [];
    let currentField = '';
    let inQuotedField = false;

    for (let i = 0; i < csv.length; i++) {
        const char = csv[i];

        if (inQuotedField) {
            if (char === '"') {
                if (i + 1 < csv.length && csv[i + 1] === '"') {
                    // Escaped quote
                    currentField += '"';
                    i++; // Skip next quote
                } else {
                    inQuotedField = false;
                }
            } else {
                currentField += char;
            }
        } else {
            if (char === '"') {
                inQuotedField = true;
            } else if (char === ',') {
                currentLine.push(currentField);
                currentField = '';
            } else if (char === '\n' || char === '\r') {
                // End of line
                if (i > 0 && csv[i - 1] !== '\n' && csv[i - 1] !== '\r') {
                   currentLine.push(currentField);
                   currentField = '';
                   if (currentLine.length > 0 || currentField) {
                     lines.push(currentLine);
                   }
                   currentLine = [];
                }
                if (char === '\r' && i + 1 < csv.length && csv[i + 1] === '\n') {
                    i++; // Handle CRLF
                }
            } else {
                currentField += char;
            }
        }
    }
    // Add the last field and line
    currentLine.push(currentField);
    if (currentLine.length > 0 || currentField) {
        lines.push(currentLine);
    }
    
    // Filter out empty lines that might be parsed
    return lines.filter(line => line.length > 1 || (line.length === 1 && line[0] !== ''));
}


async function fetchAndParseSheet(sheetUrl: string): Promise<any[]> {
    if (!sheetUrl) return [];
    try {
        const response = await fetch(sheetUrl, { cache: 'no-store' });
        if (!response.ok) {
            console.error(`Failed to fetch sheet: ${response.statusText} for url: ${sheetUrl}`);
            return [];
        }
        const csv = await response.text();
        const lines = parseCSV(csv);
        
        if (lines.length < 2) return [];

        const headers = lines[0].map(h => h.trim());
        const dataRows = lines.slice(1);

        return dataRows.map(values => {
            if (values.every(v => v === '')) return null;
            
            const rowObject: { [key: string]: string } = {};
            headers.forEach((header, index) => {
                rowObject[header] = values[index] || '';
            });
            return rowObject;

        }).filter(row => row !== null);

    } catch (error) {
        console.error(`Error in fetchAndParseSheet for ${sheetUrl}:`, error);
        return [];
    }
}

async function initializeProducts(): Promise<Product[]> {
    const fetchPromises = categoriesConfig.productCategories.map(async (categoryConfig) => {
        const rows = await fetchAndParseSheet(categoryConfig.sheetUrl);
        return rows.map(row => {
            const price = parseFloat(row.price);
             if (!row.id || !row.name || isNaN(price) || !row.imageUrl) {
                return null;
            }
            const product: Product = {
                id: row.id,
                name: row.name,
                description: row.description || '',
                price: price,
                category: (row.category || 'Products') as ProductCategory,
                unit: row.unit || undefined,
                image: {
                    id: `${row.id}-img`,
                    src: row.imageUrl,
                    alt: row.imageAlt || row.name,
                    hint: row.imageHint || row.category || 'product',
                },
                colors: row.colors ? row.colors.split(',').map(c => c.trim()) : undefined,
                sizes: row.sizes ? row.sizes.split(',').map(s => s.trim()) : undefined,
            };
            return product;
        }).filter((p): p is Product => p !== null);
    });
    
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

export const getFeaturedSections = async (): Promise<FeaturedSection[]> => {
    if (!categoriesConfig.featuredSectionsSheetUrl) {
        return [];
    }
    const rows = await fetchAndParseSheet(categoriesConfig.featuredSectionsSheetUrl);
    
    return rows.map(row => {
        const productCount = parseInt(row.productCount, 10);
        return {
            title: row.title || 'Featured',
            categories: row.categories ? row.categories.split(',').map(c => c.trim() as ProductCategory) : [],
            productCount: isNaN(productCount) ? 6 : productCount,
        };
    }).filter(section => section.title && section.categories.length > 0);
};

export const getTopCategories = async (): Promise<TopCategory[]> => {
    if (!categoriesConfig.topCategoriesSheetUrl) {
        return [];
    }
    const rows = await fetchAndParseSheet(categoriesConfig.topCategoriesSheetUrl);

    return rows.map(row => {
        if (!row.name || !row.imageUrl) {
            return null;
        }
        return {
            name: row.name,
            imageUrl: row.imageUrl,
            imageHint: row.imageHint || row.name.toLowerCase(),
        };
    }).filter((category): category is TopCategory => category !== null);
};
