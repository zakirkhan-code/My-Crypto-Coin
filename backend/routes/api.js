const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ethers } = require('ethers');

const router = express.Router();

// JWT token verify karne ke liye middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// User registration
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create new user
        const user = new User({ username, email, password });
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                walletAddress: user.walletAddress
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update wallet address
router.put('/wallet', authenticateToken, async (req, res) => {
    try {
        const { walletAddress } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { walletAddress },
            { new: true }
        ).select('-password');

        res.json({ message: 'Wallet address updated', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get transaction history
router.get('/transactions', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.json(user.transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add transaction
router.post('/transactions', authenticateToken, async (req, res) => {
    try {
        const { type, amount, fromAddress, toAddress, txHash } = req.body;
        
        const user = await User.findById(req.user.userId);
        user.transactions.push({
            type,
            amount,
            fromAddress,
            toAddress,
            txHash
        });
        
        await user.save();
        res.json({ message: 'Transaction added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;