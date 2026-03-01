import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('Auto Marketplace Backend API is Running');
});

app.listen(PORT, () => {
    console.log(\`Server is running on port \${PORT}\`);
});
