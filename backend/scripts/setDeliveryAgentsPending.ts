import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';
import config from '../src/config';

dotenv.config();

const setDeliveryAgentsPending = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoURI);
    console.log('✓ MongoDB Connected\n');

    const result = await User.updateMany(
      { role: 'delivery_agent' },
      { 
        $set: { 
          approvalStatus: 'pending',
          approvedAt: null,
          agent_status: 'DISABLED'
        } 
      }
    );

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('           DELIVERY AGENTS - APPROVAL SET TO PENDING');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log(`✓ Updated ${result.modifiedCount} delivery agents to PENDING\n`);

    console.log('───────────────────────────────────────────────────────────────');
    console.log('Delivery agents now:');
    console.log('  • Require admin approval');
    console.log('  • Have agent_status: DISABLED');
    console.log('  • Cannot accept deliveries\n');

    console.log('To approve them, run: npm run approval:approve-agents\n');

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating delivery agents:', error);
    process.exit(1);
  }
};

setDeliveryAgentsPending();
