import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';
import config from '../src/config';

dotenv.config();

const approveAllPending = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoURI);
    console.log('✓ MongoDB Connected\n');

    const now = new Date();

    // Approve all pending sellers
    const sellerResult = await User.updateMany(
      { role: 'seller', approvalStatus: 'pending' },
      { 
        $set: { 
          approvalStatus: 'approved',
          approvedAt: now
        } 
      }
    );

    // Approve all pending mechanics
    const mechanicResult = await User.updateMany(
      { role: 'mechanic', approvalStatus: 'pending' },
      { 
        $set: { 
          approvalStatus: 'approved',
          approvedAt: now
        } 
      }
    );

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('          APPROVAL STATUS UPDATED TO APPROVED');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log(`✓ Approved ${sellerResult.modifiedCount} sellers`);
    console.log(`✓ Approved ${mechanicResult.modifiedCount} mechanics\n`);

    console.log('───────────────────────────────────────────────────────────────');
    console.log('All approved sellers can now list products.');
    console.log('All approved mechanics can now offer services.\n');

    // Show stats
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const approvedSellers = await User.countDocuments({ 
      role: 'seller', 
      approvalStatus: 'approved' 
    });
    const totalMechanics = await User.countDocuments({ role: 'mechanic' });
    const approvedMechanics = await User.countDocuments({ 
      role: 'mechanic', 
      approvalStatus: 'approved' 
    });

    console.log('📊 CURRENT STATUS:');
    console.log(`   Sellers: ${approvedSellers}/${totalSellers} approved`);
    console.log(`   Mechanics: ${approvedMechanics}/${totalMechanics} approved\n`);

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error approving vendors:', error);
    process.exit(1);
  }
};

approveAllPending();
