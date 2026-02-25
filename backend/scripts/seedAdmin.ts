import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import config from '../config';

dotenv.config();

const seedAdmin = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoURI);
    console.log('MongoDB Connected');

    const adminEmail = 'admin@gmail.com';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log(`  Email: ${existingAdmin.email}`);
      console.log(`  Role: ${existingAdmin.role}`);
      console.log(`  Active: ${existingAdmin.isActive}`);
      console.log(`  Email Verified: ${existingAdmin.isEmailVerified}`);

      // Ensure the existing admin has correct flags
      if (!existingAdmin.isEmailVerified || !existingAdmin.isActive || existingAdmin.role !== 'admin') {
        await User.updateOne(
          { _id: existingAdmin._id },
          { $set: { isEmailVerified: true, isActive: true, role: 'admin', approvalStatus: 'approved' } }
        );
        console.log('Updated admin flags (isEmailVerified, isActive, approvalStatus).');
      }
    } else {
      // Create admin user
      const admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
        approvalStatus: 'approved'
      });

      console.log('Admin user created successfully!');
      console.log(`  Email: ${admin.email}`);
      console.log(`  Password: Admin@123`);
      console.log(`  Role: ${admin.role}`);
    }

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
