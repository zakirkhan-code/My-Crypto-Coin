const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ethers } = require("ethers");

const router = express.Router();

// JWT token verify karne ke liye middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

router.post('/add-wallet', authenticateToken, async (req, res) => {
    try {
        const { walletAddress } = req.body;
        const normalizedAddress = walletAddress.toLowerCase();

        // Check if wallet is already registered to any user
        const existingUser = await User.findOne({ 
            $or: [
                { walletAddress: normalizedAddress },
                { walletAddresses: normalizedAddress }
            ]
        });

        if (existingUser && existingUser._id.toString() !== req.user.userId) {
            return res.status(400).json({ 
                error: 'This wallet address is already registered to another account' 
            });
        }

        // Find current user
        const user = await User.findById(req.user.userId);
        
        // Initialize walletAddresses array if it doesn't exist
        if (!user.walletAddresses || user.walletAddresses.length === 0) {
            user.walletAddresses = user.walletAddress ? [user.walletAddress.toLowerCase()] : [];
        }

        // Check if wallet already exists in user's wallets
        if (user.walletAddresses.includes(normalizedAddress)) {
            return res.status(400).json({ 
                error: 'This wallet is already added to your account' 
            });
        }

        // Add new wallet address
        user.walletAddresses.push(normalizedAddress);
        await user.save();

        res.json({
            message: 'Wallet address added successfully',
            walletAddresses: user.walletAddresses
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove wallet address
router.post('/remove-wallet', authenticateToken, async (req, res) => {
    try {
        const { walletAddress } = req.body;
        const normalizedAddress = walletAddress.toLowerCase();

        const user = await User.findById(req.user.userId);
        
        if (!user.walletAddresses || user.walletAddresses.length <= 1) {
            return res.status(400).json({ 
                error: 'You must have at least one wallet address' 
            });
        }

        // Remove the wallet address
        user.walletAddresses = user.walletAddresses.filter(
            addr => addr.toLowerCase() !== normalizedAddress
        );

        await user.save();

        res.json({
            message: 'Wallet address removed successfully',
            walletAddresses: user.walletAddresses
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Enhanced wallet login for multiple addresses
router.post('/wallet-login', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        const normalizedAddress = walletAddress.toLowerCase();

        // Find user by wallet address (check both fields)
        const user = await User.findOne({
            $or: [
                { walletAddress: normalizedAddress },
                { walletAddresses: normalizedAddress }
            ]
        });

        if (!user) {
            return res.status(400).json({ 
                error: 'Wallet not registered. Please register first.' 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Wallet login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                walletAddress: user.walletAddress,
                walletAddresses: user.walletAddresses || [user.walletAddress]
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Enhanced registration with wallet addresses array
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, walletAddress } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email }, 
                { username },
                { walletAddress: walletAddress?.toLowerCase() }
            ]
        });

        if (existingUser) {
            if (existingUser.walletAddress === walletAddress?.toLowerCase()) {
                return res.status(400).json({ error: 'Wallet address already registered' });
            }
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create new user with wallet addresses array
        const normalizedWallet = walletAddress?.toLowerCase();
        const user = new User({ 
            username, 
            email, 
            password,
            walletAddress: normalizedWallet,
            walletAddresses: normalizedWallet ? [normalizedWallet] : []
        });
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
                email: user.email,
                walletAddress: user.walletAddress,
                walletAddresses: user.walletAddresses
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        walletAddress: user.walletAddress,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update wallet address
router.put("/wallet", authenticateToken, async (req, res) => {
  try {
    const { walletAddress } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { walletAddress },
      { new: true }
    ).select("-password");

    res.json({ message: "Wallet address updated", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction history
router.get("/transactions", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json(user.transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add transaction
router.post("/transactions", authenticateToken, async (req, res) => {
  try {
    const { type, amount, fromAddress, toAddress, txHash } = req.body;

    const user = await User.findById(req.user.userId);
    user.transactions.push({
      type,
      amount,
      fromAddress,
      toAddress,
      txHash,
    });

    await user.save();
    res.json({ message: "Transaction added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
