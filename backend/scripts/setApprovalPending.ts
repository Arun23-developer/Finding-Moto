import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';
import config from '../src/config';

dotenv.config();

const setApprovalStatus = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoURI);
    console.log('✓ MongoDB Connected\n');

    // Set all sellers to pending
    const sellerResult = await User.updateMany(
      { role: 'seller' },
      { 
        $set: { 
          approvalStatus: 'pending',
          approvedAt: null
        } 
      }
    );

    // Set all mechanics to pending
    const mechanicResult = await User.updateMany(
      { role: 'mechanic' },
      { 
        $set: { 
          approvalStatus: 'pending',
          approvedAt: null
        } 
      }
    );

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('              APPROVAL STATUS UPDATED TO PENDING');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log(`✓ Updated ${sellerResult.modifiedCount} sellers to PENDING`);
    console.log(`✓ Updated ${mechanicResult.modifiedCount} mechanics to PENDING\n`);

    console.log('───────────────────────────────────────────────────────────────');
    console.log('Sellers now require admin approval before they can operate.');
    console.log('Mechanics now require admin approval before they can operate.\n');

    console.log('To approve them, run: npm run approval:approve\n');

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating approval status:', error);
    process.exit(1);
  }
};

setApprovalStatus();
