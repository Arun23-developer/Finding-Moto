export type Product = {
  id: string;
  name: string;
  category: string;
  price: string;
  rating: number;
  image: string;
  seller: string;
  location: string;
  specs: string[];
};

export const categories = ['Super Bikes', 'Scooters', 'Spare Parts', 'Services', 'Mechanics'];

export const featuredProducts: Product[] = [
  {
    id: 'r15-v4',
    name: 'Yamaha R15 V4',
    category: 'Sport Bike',
    price: 'LKR 1,850,000',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
    seller: 'MotoHub Colombo',
    location: 'Colombo 05',
    specs: ['155cc', 'ABS', '6-speed', 'Liquid cooled'],
  },
  {
    id: 'mt-15',
    name: 'Yamaha MT-15',
    category: 'Naked Bike',
    price: 'LKR 1,650,000',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80',
    seller: 'Urban Riders',
    location: 'Kandy',
    specs: ['155cc', 'LED', 'Assist clutch', 'Street tuned'],
  },
  {
    id: 'helmet-pro',
    name: 'Apex Carbon Helmet',
    category: 'Safety Gear',
    price: 'LKR 42,000',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=1200&q=80',
    seller: 'GearPoint',
    location: 'Nugegoda',
    specs: ['Carbon shell', 'Anti-fog visor', 'DOT rated', '1.3kg'],
  },
];

export const serviceHighlights = [
  { title: 'Engine Tune-up', meta: 'From LKR 8,500', icon: 'construct-outline' },
  { title: 'Mobile Mechanic', meta: 'At your location', icon: 'location-outline' },
  { title: 'Premium Wash', meta: '45 min service', icon: 'sparkles-outline' },
] as const;
