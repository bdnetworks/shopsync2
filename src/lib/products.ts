
import type { Product } from './types';
import categories from '@/config/categories.json';

function parseCSV(csv: string): string[][] {
    const lines = csv.split('\n');
    const result: string[][] = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue; // Skip empty lines

        const obj: string[] = [];
        let currentLine = lines[i];
        let inQuotes = false;
        let field = '';

        for (let j = 0; j < currentLine.length; j++) {
            const char = currentLine[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                obj.push(field.trim());
                field = '';
            } else {
                field += char;
            }
        }
        obj.push(field.trim());
        if(obj.length === headers.length) {
            result.push(obj);
        }
    }
    return result;
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
        
        return lines.map((values, index) => {
             // Columns: 0:Name, 1:Category, 2:Price, 3:Description, 4:Size, 5:Color, 6:Tag, 7:Brand, 8:Stock, 9:Availability, 10:Thumbnail, 11:Image1, 12:Image2
             if (values.length < 11) return null; // Ensure there are enough columns

             const [name, category, price, description, size, color, tag, brand, stock, availability, thumbnail, image1, image2] = values;
             
             const product: Product = {
                id: `product_${Date.now()}_${index}`, // Generate a more unique ID
                name: name,
                description: description,
                price: parseFloat(price),
                category: category as any,
                image: {
                    id: `img_${Date.now()}_${index}`,
                    src: thumbnail,
                    alt: name,
                    hint: tag || category,
                },
                gallery: [image1, image2].filter(Boolean),
                colors: color ? color.split(',').map(c => c.trim()) : undefined,
                sizes: size ? size.split(',').map(s => s.trim()) : undefined,
                brand: brand,
                tags: tag ? tag.split(',').map(t => t.trim()) : undefined,
                stock: parseInt(stock) || 0,
                availability: availability,
            };

            // Basic validation: name, price and a valid thumbnail URL are required
            if (product.name && !isNaN(product.price) && product.image.src) {
                 try {
                    new URL(product.image.src); // Validate URL
                    return product;
                } catch (e) {
                    // console.error(`Invalid thumbnail URL for product '${product.name}': ${product.image.src}`);
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
        const allProducts = productArrays.flat();
        
        // No need to deduplicate with more unique IDs
        return allProducts;

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
