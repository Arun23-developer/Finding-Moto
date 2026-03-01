import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Seller from './models/Seller.js';
import Product from './models/Product.js';
import Order from './models/Order.js';

dotenv.config();
connectDB();

const seedDatabase = async () => {
    try {
        // Clear existing collections
        await User.deleteMany();
        await Seller.deleteMany();
        await Product.deleteMany();
        await Order.deleteMany();

        // 1. Create Super Admin
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);

        await User.create({
            name: 'Super Admin',
            email: 'admin@example.com',
            password: adminPassword,
            role: 'admin',
            status: 'active'
        });

        // 2. Create Users
        const user = await User.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: adminPassword,
            role: 'user',
            status: 'active'
        });

        const sellerUser = await User.create({
            name: 'Jane Seller',
            email: 'jane@example.com',
            password: adminPassword,
            role: 'seller',
            status: 'active'
        });

        // 3. Create Sellers
        const seller = await Seller.create({
            user_id: sellerUser._id,
            business_name: 'Auto Max',
            status: 'approved'
        });

        const pendingSellerUser = await User.create({
            name: 'Bob Pending',
            email: 'bob@example.com',
            password: adminPassword,
            role: 'user',
            status: 'active'
        });

        await Seller.create({
            user_id: pendingSellerUser._id,
            business_name: 'Bob Motors',
            status: 'pending'
        });

        // 4. Create Products
        await Product.create({
            seller_id: seller._id,
            name: 'Tesla Model S',
            price: 79999.99,
            stock: 5,
            status: 'active'
        });

        await Product.create({
            seller_id: seller._id,
            name: 'BMW i7',
            price: 85000.00,
            stock: 12,
            status: 'active'
        });

        // 5. Create Orders
        await Order.create({
            user_id: user._id,
            total: 79999.99,
            status: 'completed'
        });

        console.log('Database seeded successfully! Admin Login: admin@example.com / admin123');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
