import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';
import config from '../src/config';

dotenv.config();

// Generate random data helpers
const generateEmail = (prefix: string, index: number): string => {
  return `${prefix}${index + 1}@samplemail.com`;
};

const generatePhone = (index: number): string => {
  const baseNumber = 7700000000 + index;
  return `+94${baseNumber.toString().slice(-9)}`;
};

const firstNames = [
  'John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'James', 'Mary',
  'Robert', 'Patricia', 'William', 'Jennifer', 'Richard', 'Linda', 'Joseph',
  'Barbara', 'Thomas', 'Susan', 'Charles', 'Jessica', 'Christopher', 'Karen',
  'Daniel', 'Nancy', 'Matthew', 'Betty', 'Mark', 'Margaret', 'Donald', 'Sandra',
  'Steven', 'Ashley', 'Paul', 'Kimberly', 'Andrew', 'Donna', 'Joshua', 'Michelle'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

const shopNames = [
  'Moto Garage', 'Speed Shop', 'Bike Parts Center', 'Moto Supply', 'Custom Cycles',
  'Rider Hub', 'Performance Motors', 'Bike Paradise', 'Moto World', 'Street Bikes',
  'Pro Moto', 'Cycle Express', 'Moto Mart', 'Bike Kingdom', 'Ultimate Motors'
];

const workshopNames = [
  'Master Mechanics', 'Pro Repair Works', 'Expert Moto Service', 'Precision Shop',
  'Performance Garage', 'Rider Care Center', 'Technical Hub', 'Service Master',
  'Bike Clinic', 'Moto Experts', 'Repair Plus', 'Advanced Motors', 'Quality Service'
];

const specializations = [
  'Engine Repair',
  'Electrical Systems',
  'Transmission Work',
  'Brake Systems',
  'Suspension & Alignment',
  'Engine Tuning',
  'Custom Modifications',
  'Diagnostic Services'
];

const getRandomItem = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const seedAllData = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoURI);
    console.log('✓ MongoDB Connected\n');

    // Clear existing test data (optional - comment out if you want to preserve existing data)
    // await User.deleteMany({ email: /samplemail\.com|findingmoto\.com/ });
    // console.log('Cleared existing sample data\n');

    const credentials: any = {
      admin: [],
      sellers: [],
      mechanics: [],
      buyers: []
    };

    // ═══════════════════════════════════════════════════════════════
    // 1. ADMIN USER
    // ═══════════════════════════════════════════════════════════════
    console.log('📋 Creating Admin User...');
    const adminEmail = 'admin@findingmoto.com';
    const adminPassword = 'Admin@123';

    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      // Update existing admin
      admin.isEmailVerified = true;
      admin.isActive = true;
      admin.approvalStatus = 'approved';
      admin.password = adminPassword;
      await admin.save();
      console.log('✓ Updated existing admin user');
    } else {
      admin = await User.create({
        firstName: 'Admin',
        lastName: 'Manager',
        email: adminEmail,
        password: adminPassword,
        phone: '+94 700 000 001',
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
        approvalStatus: 'approved'
      });
      console.log('✓ Created new admin user');
    }

    credentials.admin.push({
      email: adminEmail,
      password: adminPassword
    });

    // ═══════════════════════════════════════════════════════════════
    // 2. SELLERS (5 users)
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 Creating 5 Sellers...');
    for (let i = 0; i < 5; i++) {
      const email = generateEmail('seller', i);
      const password = 'Seller@123';

      const existing = await User.findOne({ email, role: 'seller' });
      if (!existing) {
        await User.create({
          firstName: getRandomItem(firstNames),
          lastName: getRandomItem(lastNames),
          email,
          password,
          phone: generatePhone(i),
          role: 'seller',
          isEmailVerified: true,
          isActive: true,
          approvalStatus: 'approved',
          approvedAt: new Date(),
          shopName: getRandomItem(shopNames),
          shopDescription: 'Premium motorcycle parts and accessories. Fast delivery and quality guaranteed.',
          shopLocation: `Location ${i + 1}`,
          sellerBrands: ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki']
        });
        console.log(`✓ Created Seller ${i + 1}: ${email}`);
      } else {
        console.log(`✓ Seller ${i + 1} already exists: ${email}`);
      }

      credentials.sellers.push({
        email,
        password
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // 3. MECHANICS (5 users)
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 Creating 5 Mechanics...');
    for (let i = 0; i < 5; i++) {
      const email = generateEmail('mechanic', i);
      const password = 'Mechanic@123';

      const existing = await User.findOne({ email, role: 'mechanic' });
      if (!existing) {
        await User.create({
          firstName: getRandomItem(firstNames),
          lastName: getRandomItem(lastNames),
          email,
          password,
          phone: generatePhone(100 + i),
          role: 'mechanic',
          isEmailVerified: true,
          isActive: true,
          approvalStatus: 'approved',
          approvedAt: new Date(),
          specialization: getRandomItem(specializations),
          experienceYears: Math.floor(Math.random() * 15) + 3,
          workshopName: getRandomItem(workshopNames),
          workshopLocation: `Workshop Area ${i + 1}`,
          mechanicBrands: ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'Royal Enfield']
        });
        console.log(`✓ Created Mechanic ${i + 1}: ${email}`);
      } else {
        console.log(`✓ Mechanic ${i + 1} already exists: ${email}`);
      }

      credentials.mechanics.push({
        email,
        password
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // 4. BUYERS (100 users)
    // ═══════════════════════════════════════════════════════════════
    console.log('\n📋 Creating 100 Buyers...');
    let buyerCount = 0;
    for (let i = 0; i < 100; i++) {
      const email = generateEmail('buyer', i);
      const password = 'Buyer@123';

      const existing = await User.findOne({ email, role: 'buyer' });
      if (!existing) {
        await User.create({
          firstName: getRandomItem(firstNames),
          lastName: getRandomItem(lastNames),
          email,
          password,
          phone: generatePhone(200 + i),
          role: 'buyer',
          isEmailVerified: true,
          isActive: true,
          approvalStatus: 'approved',
          address: `Address ${i + 1}, City`
        });
        buyerCount++;
        if ((i + 1) % 25 === 0) {
          console.log(`✓ Created ${i + 1} buyers...`);
        }
      }
    }
    console.log(`✓ Total ${buyerCount} new buyers created (100 attempts)`);

    if (credentials.buyers.length === 0) {
      credentials.buyers.push({
        email: 'buyer1@samplemail.com',
        password: 'Buyer@123'
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // PRINT CREDENTIALS
    // ═══════════════════════════════════════════════════════════════
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                    SAMPLE ACCOUNT CREDENTIALS                  ');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('🔐 ADMIN ACCOUNT:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`  Email:    ${credentials.admin[0].email}`);
    console.log(`  Password: ${credentials.admin[0].password}`);

    console.log('\n🛍️  SELLER ACCOUNTS (5 sellers):');
    console.log('─────────────────────────────────────────────────────────────');
    credentials.sellers.forEach((cred: any, idx: number) => {
      console.log(`  Seller ${idx + 1}:`);
      console.log(`    Email:    ${cred.email}`);
      console.log(`    Password: ${cred.password}`);
    });

    console.log('\n🔧 MECHANIC ACCOUNTS (5 mechanics):');
    console.log('─────────────────────────────────────────────────────────────');
    credentials.mechanics.forEach((cred: any, idx: number) => {
      console.log(`  Mechanic ${idx + 1}:`);
      console.log(`    Email:    ${cred.email}`);
      console.log(`    Password: ${cred.password}`);
    });

    console.log('\n👤 BUYER ACCOUNTS (Sample - 100 total):');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`  Buyer 1:`);
    console.log(`    Email:    ${credentials.buyers[0].email}`);
    console.log(`    Password: ${credentials.buyers[0].password}`);
    console.log(`  (Additional 99 buyers created with pattern: buyer2@samplemail.com, ...buyer100@samplemail.com)`);
    console.log(`  All with password: Buyer@123`);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ Database seeding completed successfully!');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('📌 IMPORTANT NOTES:');
    console.log('   • Email verification is SKIPPED for all sample accounts');
    console.log('   • All sample emails use @samplemail.com (dummy domain)');
    console.log('   • Sellers and Mechanics are pre-approved');
    console.log('   • No SMTP/email sending is required\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedAllData();
