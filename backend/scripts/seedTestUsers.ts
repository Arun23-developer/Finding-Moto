/**
 * Seed the minimum set of users required by Playwright E2E tests.
 * Safe to re-run — upserts, never duplicates.
 *
 * Credentials created:
 *   Buyer  : buyer1@samplemail.com  / Buyer@123
 *   Seller : seller1@samplemail.com / Seller@123
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';
import config from '../src/config';

dotenv.config();

const TEST_USERS = [
  {
    firstName: 'Test',
    lastName: 'Buyer',
    email: 'buyer1@samplemail.com',
    password: 'Buyer@123',
    phone: '+94770000001',
    role: 'buyer' as const,
    isEmailVerified: true,
    isActive: true,
    approvalStatus: 'approved' as const,
    address: '123 Test Street, Colombo 03',
  },
  {
    firstName: 'Test',
    lastName: 'Seller',
    email: 'seller1@samplemail.com',
    password: 'Seller@123',
    phone: '+94770000002',
    role: 'seller' as const,
    isEmailVerified: true,
    isActive: true,
    approvalStatus: 'approved' as const,
    approvedAt: new Date(),
    shopName: 'Test Moto Shop',
    shopDescription: 'Playwright test seller account',
    shopLocation: 'Colombo 05',
  },
];

const seedTestUsers = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoURI);
    console.log('MongoDB Connected');

    for (const userData of TEST_USERS) {
      const existing = await User.findOne({ email: userData.email, role: userData.role });
      if (existing) {
        // Ensure it stays verified and approved even if something changed it
        await User.updateOne(
          { _id: existing._id },
          { $set: { isEmailVerified: true, isActive: true, approvalStatus: 'approved' } }
        );
        console.log(`✓ Already exists (refreshed): ${userData.email} (${userData.role})`);
      } else {
        const created = await User.create(userData);
        await User.updateOne(
          { _id: created._id },
          { $set: { isEmailVerified: true, isActive: true, approvalStatus: 'approved' } }
        );
        console.log(`✓ Created: ${userData.email} (${userData.role})`);
      }
    }

    console.log('\n── Test Credentials ────────────────────────');
    console.log('Buyer  : buyer1@samplemail.com  / Buyer@123');
    console.log('Seller : seller1@samplemail.com / Seller@123');
    console.log('────────────────────────────────────────────\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('seedTestUsers error:', error);
    process.exit(1);
  }
};

seedTestUsers();
