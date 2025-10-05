export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  town: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  categories: string[];
  isActive: boolean;
  ownerId: string;
  phone: string;
  address: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  prepTime: number;
}

export const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Chez Mama Africa',
    description: 'Traditional Cameroonian cuisine with a modern twist',
    image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
    town: 'Douala',
    rating: 4.8,
    deliveryTime: '25-35 min',
    deliveryFee: 500,
    minOrder: 2000,
    categories: ['Traditional', 'African'],
    isActive: true,
    ownerId: '2',
    phone: '+237 6XX XXX XXX',
    address: 'Akwa, Douala'
  },
  {
    id: '2',
    name: 'Le Bistro Moderne',
    description: 'French-inspired dishes with local ingredients',
    image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg',
    town: 'Yaoundé',
    rating: 4.6,
    deliveryTime: '30-40 min',
    deliveryFee: 750,
    minOrder: 3000,
    categories: ['French', 'Fine Dining'],
    isActive: true,
    ownerId: '5',
    phone: '+237 6XX XXX XXX',
    address: 'Centre-ville, Yaoundé'
  },
  {
    id: '3',
    name: 'Spicy Wings Corner',
    description: 'Best wings and grilled chicken in town',
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
    town: 'Douala',
    rating: 4.4,
    deliveryTime: '20-30 min',
    deliveryFee: 400,
    minOrder: 1500,
    categories: ['Chicken', 'Fast Food'],
    isActive: true,
    ownerId: '6',
    phone: '+237 6XX XXX XXX',
    address: 'Bonanjo, Douala'
  },
  {
    id: '4',
    name: 'Fresh Salad Bar',
    description: 'Healthy salads and fresh smoothies',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    town: 'Yaoundé',
    rating: 4.3,
    deliveryTime: '15-25 min',
    deliveryFee: 300,
    minOrder: 1000,
    categories: ['Healthy', 'Salads'],
    isActive: true,
    ownerId: '7',
    phone: '+237 6XX XXX XXX',
    address: 'Bastos, Yaoundé'
  }
];

export const mockMenuItems: MenuItem[] = [
  // Chez Mama Africa
  {
    id: '1',
    restaurantId: '1',
    name: 'Ndolé with Plantains',
    description: 'Traditional Cameroonian stew with groundnuts and bitter leaves',
    price: 2500,
    image: 'https://images.pexels.com/photos/725997/pexels-photo-725997.jpeg',
    category: 'Main Course',
    isAvailable: true,
    prepTime: 25
  },
  {
    id: '2',
    restaurantId: '1',
    name: 'Eru with Fufu',
    description: 'Delicious eru soup with pounded cassava',
    price: 2200,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    category: 'Main Course',
    isAvailable: true,
    prepTime: 20
  },
  {
    id: '3',
    restaurantId: '1',
    name: 'Grilled Tilapia',
    description: 'Fresh tilapia grilled with local spices',
    price: 3000,
    image: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg',
    category: 'Seafood',
    isAvailable: true,
    prepTime: 30
  },
  
  // Le Bistro Moderne
  {
    id: '4',
    restaurantId: '2',
    name: 'Coq au Vin Africain',
    description: 'French chicken braised with palm wine and local herbs',
    price: 4500,
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
    category: 'Main Course',
    isAvailable: true,
    prepTime: 35
  },
  {
    id: '5',
    restaurantId: '2',
    name: 'Ratatouille Tropicale',
    description: 'French ratatouille with tropical vegetables',
    price: 3200,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    category: 'Vegetarian',
    isAvailable: true,
    prepTime: 25
  },
  {
    id: '6',
    restaurantId: '2',
    name: 'Crème Brûlée Coco',
    description: 'Classic French dessert with coconut flavor',
    price: 1800,
    image: 'https://images.pexels.com/photos/725997/pexels-photo-725997.jpeg',
    category: 'Dessert',
    isAvailable: true,
    prepTime: 15
  },
  
  // Spicy Wings Corner
  {
    id: '7',
    restaurantId: '3',
    name: 'Peri-Peri Wings',
    description: 'Spicy chicken wings with our special peri-peri sauce',
    price: 1800,
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
    category: 'Wings',
    isAvailable: true,
    prepTime: 20
  },
  {
    id: '8',
    restaurantId: '3',
    name: 'Grilled Chicken Half',
    description: 'Half chicken marinated and grilled to perfection',
    price: 2500,
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
    category: 'Chicken',
    isAvailable: true,
    prepTime: 25
  },
  
  // Fresh Salad Bar
  {
    id: '9',
    restaurantId: '4',
    name: 'Tropical Quinoa Bowl',
    description: 'Quinoa with mango, avocado, and mixed greens',
    price: 2800,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    category: 'Healthy',
    isAvailable: true,
    prepTime: 15
  },
  {
    id: '10',
    restaurantId: '4',
    name: 'Green Goddess Smoothie',
    description: 'Spinach, banana, mango, and coconut water blend',
    price: 1500,
    image: 'https://images.pexels.com/photos/616833/pexels-photo-616833.jpeg',
    category: 'Beverages',
    isAvailable: true,
    prepTime: 5
  }
];

export const cameroonianTowns = [
  'Douala', 'Yaoundé', 'Garoua', 'Bafoussam', 'Bamenda', 'Maroua', 'Nkongsamba', 'Bertoua', 'Edéa', 'Loum'
];