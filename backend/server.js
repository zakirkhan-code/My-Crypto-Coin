const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Debug: Check environment variables
console.log('Environment Check:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Found' : 'Missing');

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true
}));
app.use(express.json());

// MongoDB connection with error handling
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        
        // Fallback to default local MongoDB
        try {
            await mongoose.connect('mongodb://localhost:27017/mycoin_db', {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('✅ Connected to fallback MongoDB');
        } catch (fallbackError) {
            console.error('❌ Fallback connection failed:', fallbackError.message);
            console.log('💡 Please make sure MongoDB is running on your system');
            process.exit(1);
        }
    }
};

// Connect to database
connectDB();

// Basic health check route
app.get('/', (req, res) => {
    res.json({ 
        message: '🚀 MyCoin API Server is running!',
        version: '1.0.0',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/health',
            users: '/api/users',
            transactions: '/api/transactions'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Import routes (create these files if they don't exist)
try {
    const apiRoutes = require('./routes/api');
    app.use('/api', apiRoutes);
} catch (error) {
    console.log('⚠️  API routes not found, creating basic routes...');
    
    // Basic API routes if file doesn't exist
    app.get('/api/test', (req, res) => {
        res.json({ message: 'API is working!' });
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📱 Visit: http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await mongoose.connection.close();
    process.exit(0);
});