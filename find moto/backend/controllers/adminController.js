import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Seller from '../models/Seller.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// Auth: Admin Login
export const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, role: 'admin' });
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'supersecret_admin_key_2026',
            { expiresIn: '1d' }
        );

        res.json({ id: user._id, name: user.name, email: user.email, token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Summary Stats for Dashboard Cards & Charts
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        const orders = await Order.find({ status: 'completed' });
        const revenue = orders.reduce((acc, order) => acc + order.total, 0);

        // Mock Monthly Sales for Chart.js
        const monthlySales = [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 32000, 40000, 38000, 45000];

        res.json({
            totalUsers,
            totalProducts,
            totalOrders,
            revenue,
            monthlySales
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Users Management
export const getUsers = async (req, res) => {
    try {
        // Exclude admins
        const users = await User.find({ role: { $ne: 'admin' } })
            .select('-password')
            .sort({ createdAt: -1 });
        // Map _id to id for frontend compatibility
        const mappedUsers = users.map(user => ({
            ...user.toObject(),
            id: user._id,
            created_at: user.createdAt
        }));
        res.json(mappedUsers);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const blockUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (user) {
            user.status = user.status === 'active' ? 'blocked' : 'active';
            await user.save();
        }
        res.json({ message: 'User status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await User.findByIdAndDelete(id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Sellers Management
export const getPendingSellers = async (req, res) => {
    try {
        const sellers = await Seller.find({ status: 'pending' }).populate('user_id', 'name email');

        const mappedSellers = sellers.map(seller => ({
            id: seller._id,
            business_name: seller.business_name,
            status: seller.status,
            created_at: seller.createdAt,
            name: seller.user_id.name,
            email: seller.user_id.email
        }));
        res.json(mappedSellers);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const approveSeller = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    try {
        const seller = await Seller.findByIdAndUpdate(id, { status }, { new: true });

        if (seller && status === 'approved') {
            await User.findByIdAndUpdate(seller.user_id, { role: 'seller' });
        }
        res.json({ message: \`Seller \${status} successfully\` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Products Management
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
                                  .populate('seller_id', 'business_name')
                                  .sort({ createdAt: -1 });
    const mappedProducts = products.map(product => ({
      id: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      status: product.status,
      business_name: product.seller_id ? product.seller_id.business_name : 'Unknown'
    }));
    res.json(mappedProducts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Orders Management
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user_id', 'name').sort({ createdAt: -1 });
    
    const mappedOrders = orders.map(order => ({
      id: order._id,
      total: order.total,
      status: order.status,
      created_at: order.createdAt,
      customer_name: order.user_id ? order.user_id.name : 'Unknown'
    }));
    res.json(mappedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
