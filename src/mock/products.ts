// Product data model and mock data for the shop

export interface Product {
  id: number;
  name: string;
  price: number;
  mage: string; // <-- match backend
  dsc: string;  // <-- if you want to show description
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Khmer Coffee',
    price: 3.5,
    image: 'https://picsum.photos/seed/khmercoffee/200',
  },
 
  
]; 