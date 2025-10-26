
import type { Product } from './types';
import categories from '@/config/categories.json';

// This is a sample products list for fallback purposes.
const fallbackProducts: Product[] = [
  {
    id: 'prod_001',
    name: 'Classic Cotton Tee',
    description: 'A timeless crewneck t-shirt made from 100% premium cotton. Perfect for everyday wear.',
    price: 29.99,
    category: 'Apparel',
    unit: '1 pc',
    image: {
      id: 'product-1',
      src: 'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHx0LXNoaXJ0fGVufDB8fHx8MTc2MTQ2MTYzMnww&ixlib=rb-4.1.0&q=80&w=1080',
      alt: 'A comfortable and stylish cotton t-shirt.',
      hint: 't-shirt',
    }
  },
];

let allProducts: Product[] = [];
let productsInitialized = false;

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
        const response = await fetch(sheetUrl);
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
                     console.warn(`Invalid URL for product ID ${product.id}: ${product.image.src}`);
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


async function initializeProducts() {
    if (productsInitialized) {
        return;
    }

    const fetchPromises = categories.map(category => fetchAndParseSheet(category.sheetUrl));
    
    try {
        const productArrays = await Promise.all(fetchPromises);
        allProducts = productArrays.flat();

        if (allProducts.length === 0) {
            console.warn("No products loaded from Google Sheets, using fallback data.");
            allProducts = fallbackProducts;
        }

        productsInitialized = true;
    } catch (error) {
        console.error("Failed to initialize products from Google Sheets, using fallback data.", error);
        allProducts = fallbackProducts;
        productsInitialized = true;
    }
}

export const getProducts = (): Product[] => {
    if (!productsInitialized) {
        console.warn("Products not initialized. Call initializeProducts() at your app's entry point.");
    }
    return allProducts;
}

export const getProductById = (id: string): Product | undefined => {
    if (!productsInitialized) {
        console.warn("Products not initialized. Call initializeProducts() at your app's entry point.");
    }
    return allProducts.find(p => p.id === id);
}

(async () => {
    await initializeProducts();
})();
