import bikeProduct1 from "@/assets/bike-product-1.jpg";
import bikeProduct2 from "@/assets/bike-product-2.jpg";
import bikeProduct3 from "@/assets/bike-product-3.jpg";
import bikeProduct4 from "@/assets/bike-product-4.jpg";
import bikeProduct5 from "@/assets/bike-product-5.jpg";
import bikeProduct6 from "@/assets/bike-product-6.jpg";

export interface Bike {
  id: string;
  name: string;
  price: string;
  category: string;
  specs: string;
  image: string;
  rating: number;
  description: string;
  engine: string;
  power: string;
  torque: string;
  weight: string;
  topSpeed: string;
  fuelCapacity: string;
}

export const bikes: Bike[] = [
  {
    id: "1",
    name: "Royal Enfield Classic 350",
    price: "LKR 1,250,000",
    category: "Classic",
    specs: "349cc | 20.2 HP | 120 km/h",
    image: bikeProduct1,
    rating: 4.7,
    description: "The Royal Enfield Classic 350 is an iconic motorcycle that blends timeless retro styling with modern reliability. Its thumping single-cylinder engine delivers smooth cruising power for city and highway rides.",
    engine: "349cc Single Cylinder",
    power: "20.2 HP @ 6,100 RPM",
    torque: "27 Nm @ 4,000 RPM",
    weight: "195 kg",
    topSpeed: "120 km/h",
    fuelCapacity: "13L",
  },
  {
    id: "2",
    name: "Bajaj Pulsar NS200",
    price: "LKR 785,000",
    category: "Naked",
    specs: "199.5cc | 24.5 HP | 136 km/h",
    image: bikeProduct2,
    rating: 4.6,
    description: "The Bajaj Pulsar NS200 is a performance-oriented naked streetfighter with aggressive styling, liquid cooling, and a perimeter frame for sharp handling in the city and beyond.",
    engine: "199.5cc Single Cylinder",
    power: "24.5 HP @ 9,750 RPM",
    torque: "18.5 Nm @ 8,000 RPM",
    weight: "156 kg",
    topSpeed: "136 km/h",
    fuelCapacity: "12L",
  },
  {
    id: "3",
    name: "TVS Apache RR 310",
    price: "LKR 1,450,000",
    category: "Sport",
    specs: "312.2cc | 34 HP | 160 km/h",
    image: bikeProduct3,
    rating: 4.8,
    description: "The TVS Apache RR 310 is a fully-faired sportbike co-developed with BMW Motorrad. It features ride modes, adjustable suspension, and a reverse-inclined engine for track-ready performance.",
    engine: "312.2cc Single Cylinder",
    power: "34 HP @ 9,700 RPM",
    torque: "27.3 Nm @ 7,700 RPM",
    weight: "174 kg",
    topSpeed: "160 km/h",
    fuelCapacity: "11L",
  },
  {
    id: "4",
    name: "Royal Enfield Himalayan 450",
    price: "LKR 1,850,000",
    category: "Adventure",
    specs: "452cc | 40 HP | 150 km/h",
    image: bikeProduct4,
    rating: 4.5,
    description: "The all-new Himalayan 450 is built for serious adventure riding. With a new Sherpa 450 engine, lightweight chassis, and long-travel suspension, it conquers any terrain with confidence.",
    engine: "452cc Single Cylinder",
    power: "40 HP @ 8,000 RPM",
    torque: "40 Nm @ 5,500 RPM",
    weight: "196 kg",
    topSpeed: "150 km/h",
    fuelCapacity: "17L",
  },
  {
    id: "5",
    name: "Hero Xtreme 160R",
    price: "LKR 520,000",
    category: "Street",
    specs: "163cc | 15 HP | 115 km/h",
    image: bikeProduct5,
    rating: 4.4,
    description: "The Hero Xtreme 160R is a sporty commuter with sharp styling, excellent fuel efficiency, and a refined engine that delivers peppy performance for daily riding.",
    engine: "163cc Single Cylinder",
    power: "15 HP @ 8,500 RPM",
    torque: "14 Nm @ 6,500 RPM",
    weight: "138.5 kg",
    topSpeed: "115 km/h",
    fuelCapacity: "12L",
  },
  {
    id: "6",
    name: "KTM 390 Duke",
    price: "LKR 1,650,000",
    category: "Naked",
    specs: "373cc | 43 HP | 167 km/h",
    image: bikeProduct6,
    rating: 4.8,
    description: "Made in India by Bajaj-KTM, the 390 Duke is a corner-carving naked sport with a powerful single-cylinder engine, WP suspension, and cutting-edge electronics including cornering ABS.",
    engine: "373cc Single Cylinder",
    power: "43 HP @ 9,000 RPM",
    torque: "37 Nm @ 7,000 RPM",
    weight: "167 kg",
    topSpeed: "167 km/h",
    fuelCapacity: "13.4L",
  },
];

export interface Mechanic {
  id: string;
  name: string;
  experience: string;
  rating: number;
  specialty: string;
}

export const mechanics: Mechanic[] = [
  { id: "1", name: "Rajesh Kumar", experience: "12 Years", rating: 4.9, specialty: "Engine Specialist" },
  { id: "2", name: "Arun Prakash", experience: "8 Years", rating: 4.7, specialty: "Electrical Systems" },
  { id: "3", name: "Vikram Singh", experience: "15 Years", rating: 4.8, specialty: "Suspension & Brakes" },
  { id: "4", name: "Mohammed Irfan", experience: "10 Years", rating: 4.6, specialty: "Custom Modifications" },
];

export interface SparePart {
  id: string;
  name: string;
  price: string;
  category: string;
  brand: string;
}

export const spareParts: SparePart[] = [
  { id: "1", name: "High-Performance Brake Pads", price: "LKR 8,500", category: "Brakes", brand: "Brembo" },
  { id: "2", name: "LED Headlight Assembly", price: "LKR 19,900", category: "Electrical", brand: "Philips" },
  { id: "3", name: "Racing Exhaust System", price: "LKR 62,500", category: "Exhaust", brand: "Akrapovič" },
  { id: "4", name: "Chain & Sprocket Kit", price: "LKR 11,500", category: "Drivetrain", brand: "DID" },
  { id: "5", name: "Air Filter Element", price: "LKR 2,950", category: "Engine", brand: "K&N" },
  { id: "6", name: "Engine Oil 10W-40", price: "LKR 4,250", category: "Fluids", brand: "Motul" },
];
