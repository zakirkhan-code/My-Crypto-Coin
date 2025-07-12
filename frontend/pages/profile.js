import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { useToast } from '../context/ToastContext';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [walletAddresses, setWalletAddresses] = useState([]);
    const [newWalletAddress, setNewWalletAddress] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingWallet, setIsAddingWallet] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAddOptions, setShowAddOptions] = useState(false);
    const [availableAccounts, setAvailableAccounts] = useState([]);
    const router = useRouter();
    const toast = useToast();

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                toast.error('Please login first! 🔐');
                router.push('/login');
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                setWalletAddresses(userData.walletAddresses || [userData.walletAddress].filter(Boolean));
            } else {
                throw new Error('Failed to load profile');
            }
        } catch (error) {
            console.error('Profile load error:', error);
            setError('Failed to load profile');
            toast.error('Failed to load profile 😞');
        }
        setIsLoading(false);
    };

    const loadMetaMaskAccounts = async () => {
        try {
            if (typeof window.ethereum === 'undefined') {
                toast.error('MetaMask is not installed! Please install MetaMask first. 🦊');
                return;
            }

            toast.info('Loading MetaMask accounts... ⏳');

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            const availableAccounts = accounts.filter(account => 
                !walletAddresses.some(wallet => 
                    wallet.toLowerCase() === account.toLowerCase()
                )
            );

            setAvailableAccounts(availableAccounts);
            setShowAddOptions(true);
            setError('');
            
            if (availableAccounts.length === 0) {
                toast.info('All your MetaMask accounts are already added to your profile 📱');
            } else {
                toast.success(`Found ${availableAccounts.length} new accounts available to add! 🎉`);
            }
        } catch (error) {
            console.error('MetaMask connection error:', error);
            toast.error('Failed to connect MetaMask 😞');
        }
    };

    const addSpecificWallet = async (address) => {
        setIsAddingWallet(true);
        setError('');
        setSuccess('');

        try {
            await addWalletAddress(address);
            setShowAddOptions(false);
            setAvailableAccounts([]);
        } catch (error) {
            console.error('Add wallet error:', error);
        }
        setIsAddingWallet(false);
    };

    const addManualWallet = async () => {
        if (!newWalletAddress) {
            const errorMsg = 'Please enter a wallet address';
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        if (!ethers.utils.isAddress(newWalletAddress)) {
            const errorMsg = 'Invalid wallet address format';
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        setIsAddingWallet(true);
        setError('');
        setSuccess('');

        try {
            await addWalletAddress(newWalletAddress);
            setNewWalletAddress('');
            setShowAddOptions(false);
        } catch (error) {
            console.error('Add manual wallet error:', error);
        }
        setIsAddingWallet(false);
    };

    const addWalletAddress = async (address) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/add-wallet`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ walletAddress: address })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('');
                setError('');
                toast.success(`🎉 Wallet ${address.slice(0, 6)}...${address.slice(-4)} added successfully!`);
                loadUserProfile();
                
                const userData = JSON.parse(localStorage.getItem('userData'));
                userData.walletAddresses = data.walletAddresses;
                localStorage.setItem('userData', JSON.stringify(userData));
                
            } else {
                setError('');
                toast.error(data.error || 'Failed to add wallet 😞');
            }
        } catch (error) {
            console.error('Add wallet error:', error);
            toast.error('Network error occurred 🌐');
        }
    };

    const removeWalletAddress = async (address) => {
        if (walletAddresses.length <= 1) {
            toast.warning('You must have at least one wallet address 📱');
            return;
        }

        const confirmRemove = confirm(`Remove wallet ${address.slice(0, 6)}...${address.slice(-4)} from your profile?`);
        if (!confirmRemove) return;

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/remove-wallet`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ walletAddress: address })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('');
                toast.success('Wallet removed successfully! 🗑️');
                loadUserProfile();
            } else {
                setError('');
                toast.error(data.error || 'Failed to remove wallet');
            }
        } catch (error) {
            console.error('Remove wallet error:', error);
            toast.error('Network error occurred');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        toast.success('Logged out successfully! See you soon! 👋');
        setTimeout(() => {
            router.push('/');
        }, 1000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900">
            <Head>
                <title>Profile - MyCoin</title>
            </Head>

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-white">My Profile</h1>
                    <div className="flex space-x-4">
                        <Link href="/dashboard">
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition duration-300">
                                Dashboard
                            </button>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition duration-300"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="bg-red-600 text-white p-4 rounded-lg mb-6 flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={() => setError('')} className="text-xl">×</button>
                    </div>
                )}
                {success && (
                    <div className="bg-green-600 text-white p-4 rounded-lg mb-6 flex justify-between items-center">
                        <span>{success}</span>
                        <button onClick={() => setSuccess('')} className="text-xl">×</button>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* User Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Account Information</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-gray-300 text-sm">Username</label>
                                    <p className="text-white font-medium">{user?.username}</p>
                                </div>
                                <div>
                                    <label className="text-gray-300 text-sm">Email</label>
                                    <p className="text-white font-medium">{user?.email}</p>
                                </div>
                                <div>
                                    <label className="text-gray-300 text-sm">Member Since</label>
                                    <p className="text-white font-medium">
                                        {new Date(user?.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-gray-300 text-sm">Total Wallets</label>
                                    <p className="text-white font-medium">{walletAddresses.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Wallet Management */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Wallet Addresses</h3>
                                <button
                                    onClick={loadMetaMaskAccounts}
                                    disabled={isAddingWallet}
                                    className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-600 text-black font-bold px-4 py-2 rounded-lg transition duration-300 flex items-center space-x-2"
                                >
                                    <span>➕</span>
                                    <span>Add Wallet</span>
                                </button>
                            </div>

                            {/* Add Wallet Options */}
                            {showAddOptions && (
                                <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                                    <h4 className="text-white font-semibold mb-4">Choose how to add wallet:</h4>
                                    
                                    {/* MetaMask Accounts */}
                                    {availableAccounts.length > 0 && (
                                        <div className="mb-4">
                                            <h5 className="text-gray-300 mb-2">Available MetaMask Accounts:</h5>
                                            <div className="space-y-2">
                                                {availableAccounts.map((account, index) => (
                                                    <div key={account} className="flex justify-between items-center bg-gray-700 rounded p-3">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                                                <span className="text-black font-bold text-xs">
                                                                    {index + walletAddresses.length + 1}
                                                                </span>
                                                            </div>
                                                            <span className="text-white font-mono text-sm">{account}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => addSpecificWallet(account)}
                                                            disabled={isAddingWallet}
                                                            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm transition duration-300"
                                                        >
                                                            Add This
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {availableAccounts.length === 0 && (
                                        <div className="mb-4 p-3 bg-yellow-600/20 border border-yellow-600 rounded">
                                            <p className="text-yellow-400 text-sm">
                                                All your MetaMask accounts are already added to your profile.
                                            </p>
                                        </div>
                                    )}

                                    {/* Manual Address Input */}
                                    <div className="border-t border-gray-600 pt-4">
                                        <h5 className="text-gray-300 mb-2">Or enter wallet address manually:</h5>
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={newWalletAddress}
                                                onChange={(e) => setNewWalletAddress(e.target.value)}
                                                placeholder="0x..."
                                                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                            />
                                            <button
                                                onClick={addManualWallet}
                                                disabled={isAddingWallet}
                                                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white px-4 py-2 rounded transition duration-300"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={() => {
                                                setShowAddOptions(false);
                                                setAvailableAccounts([]);
                                                setNewWalletAddress('');
                                            }}
                                            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition duration-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Wallet List */}
                            <div className="space-y-3">
                                {walletAddresses.map((address, index) => (
                                    <div key={address} className="bg-gray-800/50 rounded-lg p-4 flex justify-between items-center">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                                <span className="text-black font-bold">
                                                    {index === 0 ? '👑' : '🦊'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-white font-mono text-sm">{address}</p>
                                                <p className="text-gray-400 text-xs">
                                                    {index === 0 ? 'Primary Wallet' : `Wallet ${index + 1}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(address);
                                                    toast.success('Address copied to clipboard! 📋');
                                                }}
                                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs transition duration-300"
                                            >
                                                📋 Copy
                                            </button>
                                            <button
                                                onClick={() => window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank')}
                                                className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs transition duration-300"
                                            >
                                                🔍 View
                                            </button>
                                            {walletAddresses.length > 1 && (
                                                <button
                                                    onClick={() => removeWalletAddress(address)}
                                                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs transition duration-300"
                                                >
                                                    🗑️ Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Security Info */}
                            <div className="mt-6 bg-blue-600/20 border border-blue-600 rounded-lg p-4">
                                <h4 className="text-blue-400 font-semibold mb-2">🔒 Security Features</h4>
                                <ul className="text-gray-300 text-sm space-y-1">
                                    <li>• Only your registered wallets can access your dashboard</li>
                                    <li>• Automatic logout if unauthorized wallet is detected</li>
                                    <li>• You can add multiple wallets to your account</li>
                                    <li>• Remove wallets anytime (keep at least one)</li>
                                    <li>• Same wallet cannot be used by multiple users</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}