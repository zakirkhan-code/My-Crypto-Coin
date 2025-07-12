const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    walletAddress: {
        type: String,
        default: null
    },
    // NEW: Support multiple wallet addresses
    walletAddresses: [{
        type: String,
        lowercase: true
    }],
    tokenBalance: {
        type: Number,
        default: 0
    },
    transactions: [{
        type: {
            type: String,
            enum: ['send', 'receive', 'mint'],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        fromAddress: String,
        toAddress: String,
        txHash: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Password hash karne ke liye pre-save middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Password compare method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);