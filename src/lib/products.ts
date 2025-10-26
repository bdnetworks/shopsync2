import { PlaceHolderImages } from './placeholder-images';
import type { Product } from './types';

// This is a sample products list. You should replace it with your own data.
const products: Product[] = [
  {
    id: 'prod_001',
    name: 'Classic Cotton Tee',
    description: 'A timeless crewneck t-shirt made from 100% premium cotton. Perfect for everyday wear.',
    price: 29.99,
    category: 'Apparel',
    unit: '1 pc',
    image: {
      id: 'product-1',
      src: PlaceHolderImages.find(p => p.id === 'product-1')?.imageUrl || '',
      alt: PlaceHolderImages.find(p => p.id === 'product-1')?.description || '',
      hint: PlaceHolderImages.find(p => p.id === 'product-1')?.imageHint || '',
    }
  },
  {
    id: 'prod_002',
    name: 'Urban Explorer Backpack',
    description: 'A durable and stylish backpack crafted from genuine leather, with multiple compartments for all your gear.',
    price: 149.99,
    category: 'Bags',
    unit: '1 pc',
    image: {
      id: 'product-2',
      src: PlaceHolderImages.find(p => p.id === 'product-2')?.imageUrl || '',
      alt: PlaceHolderImages.find(p => p.id === 'product-2')?.description || '',
      hint: PlaceHolderImages.find(p => p.id === 'product-2')?.imageHint || '',
    }
  },
  {
    id: 'prod_012',
    name: 'Classic Leather Belt',
    description: 'A versatile and durable belt made from 100% genuine leather with a solid brass buckle.',
    price: 59.99,
    category: 'Accessories',
    unit: '1 pc',
    image: {
      id: 'product-12',
      src: PlaceHolderImages.find(p => p.id === 'product-12')?.imageUrl || '',
      alt: PlaceHolderImages.find(p => p.id === 'product-12')?.description || '',
      hint: PlaceHolderImages.find(p => p.id === 'product-12')?.imageHint || '',
    }
  },
];

let allProducts: Product[] = [];
let productsInitialized = false;

// NOTE: This is a temporary solution. For a real app, you should use a proper database
// and fetch the data from an API. The data is fetched from a Google Sheet and cached.
async function initializeProducts() {
    if (productsInitialized) {
        return;
    }

    try {
        // IMPORTANT: Replace this with your own Google Sheet CSV URL
        // 1. Create a Google Sheet with the same columns as the products object.
        // 2. Click on File -> Share -> Publish to web.
        // 3. Select "Comma-separated values (.csv)" and publish.
        // 4. Copy the generated URL and paste it below.
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5pGjG0pBCfqw2n31aJ_xP_TsjL-1VDPEXL_DD1Nq60EHod2gmMO0Y4Ci9tS_c9Kj7aR8Mv3A3fB4u/pub?output=csv');
        const csv = await response.text();
        const lines = csv.split('\n').slice(1);
        
        const productsFromSheet = lines.map(line => {
            const [id, name, description, price, category, unit, imageId] = line.split(',').map(s => s.trim());
            const image = PlaceHolderImages.find(p => p.id === imageId);

            return {
                id,
                name,
                description,
                price: parseFloat(price),
                category,
                unit,
                image: {
                    id: imageId,
                    src: image?.imageUrl || '',
                    alt: image?.description || '',
                    hint: image?.imageHint || '',
                }
            } as Product;
        }).filter(p => p.id); // Filter out any empty rows

        allProducts = productsFromSheet;
        productsInitialized = true;
    } catch (error) {
        console.error("Failed to fetch products from Google Sheet, using fallback data.", error);
        // If fetching fails, use the local products as a fallback
        allProducts = products;
        productsInitialized = true;
    }
}


export const getProducts = (): Product[] => {
    if (!productsInitialized) {
        // This is not ideal for server components, but it's a simple way to handle initialization
        // on first access. A better approach would be to ensure initialization happens at app startup.
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

// Initialize products on module load. This works for client-side rendering and server-side
// if the module is loaded once per request.
(async () => {
    await initializeProducts();
})();
