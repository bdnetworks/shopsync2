
import type { Product } from './types';
import categories from '@/config/categories.json';

function parseCSV(csv: string): string[][] {
    const lines: string[][] = [];
    let currentLine: string[] = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < csv.length; i++) {
        const char = csv[i];

        if (inQuotes) {
            if (char === '"') {
                if (i + 1 < csv.length && csv[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                field += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                currentLine.push(field);
                field = '';
            } else if (char === '\n' || char === '\r') {
                if(i > 0 && csv[i-1] !== '\n' && csv[i-1] !== '\r') {
                    currentLine.push(field);
                    field = '';
                    lines.push(currentLine);
                    currentLine = [];
                }
                 if (char === '\r' && i + 1 < csv.length && csv[i+1] === '\n') {
                    i++; // Handle CRLF
                }
            } else {
                field += char;
            }
        }
    }

    if (field || currentLine.length > 0) {
        currentLine.push(field);
        lines.push(currentLine);
    }
    
    // remove header
    return lines.length > 1 ? lines.slice(1) : [];
}

async function fetchAndParseSheet(sheetUrl: string): Promise<Product[]> {
     if (!sheetUrl) return [];
    try {
        const response = await fetch(sheetUrl, { cache: 'no-store' });
        if (!response.ok) {
            console.error(`Failed to fetch sheet: ${response.statusText} for url: ${sheetUrl}`);
            return [];
        }
        const csv = await response.text();
        
        const lines = parseCSV(csv);
        
        return lines.map(values => {
             const [id, name, description, price, category, unit, imageUrl, imageAlt, imageHint] = values;
             
             const product: Product = {
                id: id?.trim(),
                name: name?.trim(),
                description: description?.trim(),
                price: parseFloat(price?.trim()),
                category: category?.trim() as any,
                unit: unit?.trim(),
                image: {
                    id: id?.trim() || `img_${Math.random()}`,
                    src: imageUrl?.trim(),
                    alt: imageAlt?.trim(),
                    hint: imageHint?.trim(),
                }
            };

            // Basic validation
            if (product.id && product.name && product.image.src && !isNaN(product.price)) {
                 try {
                    new URL(product.image.src); // Validate URL
                    return product;
                } catch (e) {
                    return null;
                }
            }
            return null;
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
        return productArrays.flat();
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

