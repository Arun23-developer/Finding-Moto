import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';
import config from '../src/config';

dotenv.config();

const approveDeliveryAgents = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoURI);
    console.log('✓ MongoDB Connected\n');

    const now = new Date();

    const result = await User.updateMany(
      { role: 'delivery_agent', approvalStatus: 'pending' },
      { 
        $set: { 
          approvalStatus: 'approved',
          approvedAt: now,
          agent_status: 'ENABLED'
        } 
      }
    );

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('         DELIVERY AGENTS - APPROVAL SET TO APPROVED');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log(`✓ Approved ${result.modifiedCount} delivery agents\n`);

    // Show stats
    const totalAgents = await User.countDocuments({ role: 'delivery_agent' });
    const approvedAgents = await User.countDocuments({ 
      role: 'delivery_agent', 
      approvalStatus: 'approved' 
    });
    const enabledAgents = await User.countDocuments({ 
      role: 'delivery_agent', 
      agent_status: 'ENABLED'
    });

    console.log('───────────────────────────────────────────────────────────────');
    console.log('Delivery agents now:');
    console.log('  • Are approved');
    console.log('  • Have agent_status: ENABLED');
    console.log('  • Can accept deliveries\n');

    console.log('📊 DELIVERY AGENT STATUS:');
    console.log(`   Total Agents: ${totalAgents}`);
    console.log(`   Approved: ${approvedAgents}/${totalAgents}`);
    console.log(`   Enabled: ${enabledAgents}/${totalAgents}\n`);

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error approving delivery agents:', error);
    process.exit(1);
  }
};

approveDeliveryAgents();
