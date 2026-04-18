import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { IUser } from '../src/models/User';
import Service from '../src/models/Service';
import Product from '../src/models/Product';
import config from '../src/config';

dotenv.config();

type MechanicSeed = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  experienceYears: number;
  workshopName: string;
  workshopLocation: string;
};

type ServiceTemplate = {
  name: string;
  category: string;
  duration: string;
  basePrice: number;
  description: string;
};

type ProductTemplate = {
  name: string;
  category: string;
  brand: string;
  basePrice: number;
  stock: number;
  description: string;
};

const MECHANICS: MechanicSeed[] = [
  {
    firstName: 'P. Saravanappiriyan',
    lastName: 'Thiruchelvam',
    email: 'psaravanappiriyan@gmail.com',
    phone: '+94 76 398 1174',
    specialization: 'Engine Overhaul & Performance Tuning',
    experienceYears: 11,
    workshopName: 'Saravan Moto Works',
    workshopLocation: 'Kopay, Jaffna',
  },
  {
    firstName: 'Nanthujan',
    lastName: 'Sivapalan',
    email: 'nanthujan0@gmail.com',
    phone: '+94 77 912 3488',
    specialization: 'Electrical, Sensors & Diagnostics',
    experienceYears: 9,
    workshopName: 'Nanthu Bike Diagnostics',
    workshopLocation: 'Stanley Road, Jaffna',
  },
];

const SERVICE_LIBRARY: ServiceTemplate[] = [
  {
    name: 'Full Service - 150cc to 250cc',
    category: 'Periodic Maintenance',
    duration: '2h 30m',
    basePrice: 8500,
    description: 'Comprehensive periodic service inspired by common OEM maintenance checklists: oil change, filter check, chain clean/lube, and fastener inspection.',
  },
  {
    name: 'Engine Oil + Oil Filter Replacement',
    category: 'Engine Care',
    duration: '45m',
    basePrice: 3500,
    description: 'Oil and filter replacement using viscosity grades recommended in mainstream motorcycle owner manuals for tropical riding conditions.',
  },
  {
    name: 'Chain & Sprocket Kit Installation',
    category: 'Drivetrain',
    duration: '1h 20m',
    basePrice: 5200,
    description: 'Front/rear sprocket and chain replacement with chain slack adjustment based on manufacturer range specs published for commuter and sport bikes.',
  },
  {
    name: 'Brake Pad + Brake Fluid Service',
    category: 'Braking System',
    duration: '1h 10m',
    basePrice: 4800,
    description: 'Disc pad replacement and DOT4 fluid bleed inspired by standard workshop procedures used by top international service centers.',
  },
  {
    name: 'EFI/ECU Scan and Fault Diagnosis',
    category: 'Diagnostics',
    duration: '1h',
    basePrice: 4200,
    description: 'Scan tool-based diagnosis for sensor and actuator faults, with recommendations based on publicly documented OBD troubleshooting practices.',
  },
  {
    name: 'Battery, Charging & Starter Test',
    category: 'Electrical',
    duration: '40m',
    basePrice: 2800,
    description: 'Charging-system and starter current checks using benchmark test flows found in international motorcycle electrical service guides.',
  },
  {
    name: 'Front Fork Seal and Oil Service',
    category: 'Suspension',
    duration: '2h',
    basePrice: 7200,
    description: 'Fork disassembly, seal replacement, and oil refill with setup guidance aligned with widely used rider and suspension setup references.',
  },
  {
    name: 'Pre-Trip Safety Inspection',
    category: 'Inspection',
    duration: '35m',
    basePrice: 1800,
    description: 'Quick touring safety check covering tires, brakes, lights, chain, and coolant inspired by global rider association pre-ride checklists.',
  },
];

const IMAGE_URLS = [
  'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/995301/pexels-photo-995301.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/1715193/pexels-photo-1715193.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/1309772/pexels-photo-1309772.jpeg?auto=compress&cs=tinysrgb&w=1200',
];

const PRODUCT_LIBRARY: ProductTemplate[] = [
  {
    name: 'NGK Iridium Spark Plug Set',
    category: 'Electrical',
    brand: 'NGK',
    basePrice: 3200,
    stock: 24,
    description: 'Long-life iridium plug set used in popular commuter and sport motorcycles for reliable ignition performance.',
  },
  {
    name: 'DID Chain and Sprocket Kit',
    category: 'Transmission',
    brand: 'DID',
    basePrice: 9800,
    stock: 12,
    description: 'Heavy-duty chain/sprocket combo selected from high-demand kits sold by online moto parts stores.',
  },
  {
    name: 'EBC Front Brake Pad Pair',
    category: 'Brakes',
    brand: 'EBC',
    basePrice: 4500,
    stock: 18,
    description: 'Sintered brake pads designed for better bite and heat resistance on city and highway rides.',
  },
  {
    name: 'Motul 7100 10W40 Engine Oil 1L',
    category: 'Engine Parts',
    brand: 'Motul',
    basePrice: 4200,
    stock: 30,
    description: 'Fully synthetic motorcycle engine oil preferred by many workshops for smooth shifting and hot-weather protection.',
  },
  {
    name: 'Yuasa 12V Maintenance-Free Battery',
    category: 'Electrical',
    brand: 'Yuasa',
    basePrice: 11500,
    stock: 10,
    description: 'Sealed battery model compatible with several 150cc-250cc bikes, known for dependable cold starts.',
  },
];

const ensureMechanic = async (mechanicData: MechanicSeed): Promise<IUser> => {
  let mechanic = await User.findOne({ email: mechanicData.email, role: 'mechanic' }).select('+password');

  if (!mechanic) {
    mechanic = await User.create({
      ...mechanicData,
      role: 'mechanic',
      password: 'mechanic123',
      isEmailVerified: true,
      isActive: true,
      approvalStatus: 'approved',
      approvedAt: new Date(),
    });
  }

  mechanic.firstName = mechanicData.firstName;
  mechanic.lastName = mechanicData.lastName;
  mechanic.phone = mechanicData.phone;
  mechanic.specialization = mechanicData.specialization;
  mechanic.experienceYears = mechanicData.experienceYears;
  mechanic.workshopName = mechanicData.workshopName;
  mechanic.workshopLocation = mechanicData.workshopLocation;
  mechanic.isActive = true;
  mechanic.isEmailVerified = true;
  mechanic.approvalStatus = 'approved';
  mechanic.approvedAt = new Date();
  mechanic.password = 'mechanic123';

  await mechanic.save();

  const fresh = await User.findById(mechanic._id);
  if (!fresh) {
    throw new Error(`Failed to load mechanic account: ${mechanicData.email}`);
  }

  return fresh;
};

const buildServicesForMechanic = (mechanic: IUser, indexOffset: number) => {
  return SERVICE_LIBRARY.map((template, idx) => {
    const dynamicPrice = template.basePrice + ((idx + indexOffset) % 3) * 300;
    return {
      mechanic: mechanic._id,
      name: template.name,
      description: `${template.description} Available at ${mechanic.workshopName || 'our workshop'}.`,
      category: template.category,
      duration: template.duration,
      price: dynamicPrice,
      active: true,
    };
  });
};

const buildProductsForMechanic = (mechanic: IUser, indexOffset: number) => {
  return PRODUCT_LIBRARY.map((template, idx) => {
    const price = template.basePrice + ((indexOffset + idx) % 3) * 250;
    const imageOne = IMAGE_URLS[(idx + indexOffset) % IMAGE_URLS.length];
    const imageTwo = IMAGE_URLS[(idx + indexOffset + 2) % IMAGE_URLS.length];
    const sku = `MECH-${String(indexOffset + 1).padStart(2, '0')}-${String(idx + 1).padStart(3, '0')}`;
    return {
      seller: mechanic._id,
      name: template.name,
      description: `${template.description} Supplied by ${mechanic.workshopName || 'workshop stock'}.`,
      category: template.category,
      brand: template.brand,
      price,
      originalPrice: price + 600,
      stock: template.stock,
      images: [imageOne, imageTwo],
      sku,
      status: 'active' as const,
      type: 'product' as const,
      views: 0,
      sales: 0,
    };
  });
};

const seedServices = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoURI);
    console.log('MongoDB Connected');

    const mechanics = await Promise.all(MECHANICS.map((m) => ensureMechanic(m)));

    const allServices = mechanics.flatMap((mechanic, index) =>
      buildServicesForMechanic(mechanic, index)
    );

    const serviceOps = allServices.map((doc) => ({
      updateOne: {
        filter: { mechanic: doc.mechanic, name: doc.name },
        update: { $set: doc },
        upsert: true,
      },
    }));

    const serviceResult = await Service.bulkWrite(serviceOps, { ordered: false });

    const allProducts = mechanics.flatMap((mechanic, index) =>
      buildProductsForMechanic(mechanic, index)
    );

    const productOps = allProducts.map((doc) => ({
      updateOne: {
        filter: { seller: doc.seller, sku: doc.sku },
        update: { $set: doc },
        upsert: true,
      },
    }));

    const productResult = await Product.bulkWrite(productOps, { ordered: false });

    console.log('Seeded/updated mechanic services.');
    console.log(`Services - Upserted: ${serviceResult.upsertedCount || 0}, Modified: ${serviceResult.modifiedCount || 0}, Matched: ${serviceResult.matchedCount || 0}`);
    console.log('Seeded/updated mechanic products.');
    console.log(`Products - Upserted: ${productResult.upsertedCount || 0}, Modified: ${productResult.modifiedCount || 0}, Matched: ${productResult.matchedCount || 0}`);
    console.log(`Created dataset: ${SERVICE_LIBRARY.length} services + ${PRODUCT_LIBRARY.length} products for each requested mechanic.`);
    console.log('\nMechanic credentials for testing:');
    console.log('psaravanappiriyan@gmail.com / mechanic123');
    console.log('nanthujan0@gmail.com / mechanic123');

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding services:', error);
    process.exit(1);
  }
};

seedServices();
