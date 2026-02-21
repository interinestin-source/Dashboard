
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  features: string[];
  specifications: {
    label: string;
    value: string;
  }[];
  inStock: boolean;
  rating: number;
  reviews: number;
}
