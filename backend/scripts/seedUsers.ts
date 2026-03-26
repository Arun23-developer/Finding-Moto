import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';
import config from '../src/config';

dotenv.config();

const sampleUsers = [
  // ─── Sellers ──────────────────────────────────────────────────────
  {
    firstName: 'Nanthujan',
    lastName: 'Sivapalan',
    email: 'nanthujan0@gmail.com',
    password: 'seller123',
    phone: '+94 77 912 3488',
    role: 'seller' as const,
    isEmailVerified: true,
    isActive: true,
    approvalStatus: 'approved' as const,
    approvedAt: new Date(),
    shopName: 'Nanthu Moto Garage Supply',
    shopDescription: 'Curated motorcycle spare parts and performance accessories inspired by popular online moto catalogs and rider communities.',
    shopLocation: 'Stanley Road, Jaffna',
  },
  {
    firstName: 'Nimal',
    lastName: 'Silva',
    email: 'seller2@gmail.com',
    password: 'seller123',
    phone: '+94 71 234 5678',
    role: 'seller' as const,
    isEmailVerified: true,
    isActive: true,
    approvalStatus: 'approved' as const,
    approvedAt: new Date(),
    shopName: 'Silva Motors & Parts',
    shopDescription: 'Authorized dealer for Honda, Toyota, and Suzuki spare parts. Genuine and aftermarket parts available.',
    shopLocation: '12/B, Kandy Road, Peradeniya',
  },

  // ─── Mechanics ────────────────────────────────────────────────────
  {
    firstName: 'P. Saravanappiriyan',
    lastName: 'Thiruchelvam',
    email: 'psaravanappiriyan@gmail.com',
    password: 'mechanic123',
    phone: '+94 76 398 1174',
    role: 'mechanic' as const,
    isEmailVerified: true,
    isActive: true,
    approvalStatus: 'approved' as const,
    approvedAt: new Date(),
    specialization: 'Engine Overhaul & Performance Tuning',
    experienceYears: 11,
    workshopName: 'Saravan Moto Works',
    workshopLocation: 'Kopay, Jaffna',
  },
  {
    firstName: 'Nanthujan',
    lastName: 'Sivapalan',
    email: 'nanthujan0@gmail.com',
    password: 'mechanic123',
    phone: '+94 77 912 3488',
    role: 'mechanic' as const,
    isEmailVerified: true,
    isActive: true,
    approvalStatus: 'approved' as const,
    approvedAt: new Date(),
    specialization: 'Electrical, Sensors & Diagnostics',
    experienceYears: 9,
    workshopName: 'Nanthu Bike Diagnostics',
    workshopLocation: 'Stanley Road, Jaffna',
  },
];

const seedUsers = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoURI);
    console.log('MongoDB Connected');

    for (const userData of sampleUsers) {
      const existing = await User.findOne({ email: userData.email, role: userData.role });
      if (existing) {
        console.log(`✓ Already exists: ${existing.email} (${existing.role})`);
      } else {
        const user = await User.create(userData);
        // Force approval status to 'approved' since pre-save hook sets it to 'pending'
        await User.updateOne(
          { _id: user._id },
          { $set: { approvalStatus: 'approved', approvedAt: new Date() } }
        );
        console.log(`✓ Created: ${user.email} (${user.role})`);
      }
    }

    console.log('\n── Sample Credentials ──────────────────────');
    console.log('Seller 1:   nanthujan0@gmail.com / seller123');
    console.log('Seller 2:   seller2@gmail.com   / seller123');
    console.log('Mechanic 1: psaravanappiriyan@gmail.com / mechanic123');
    console.log('Mechanic 2: nanthujan0@gmail.com / mechanic123');
    console.log('────────────────────────────────────────────\n');

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
