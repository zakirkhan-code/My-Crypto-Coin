import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { useToast } from '../context/ToastContext';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [walletAddress, setWalletAddress] = useState('');
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const toast = useToast();

    const connectWallet = async () => {
        try {
            if (typeof window.ethereum === 'undefined') {
                toast.error('MetaMask is not installed! Please install MetaMask first.');
                return;
            }

            toast.info('Connecting to MetaMask... 🦊');

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            setWalletAddress(accounts[0]);
            setIsWalletConnected(true);
            setError('');
            toast.success('Wallet connected successfully! ✅');
        } catch (error) {
            const errorMsg = 'Wallet connection failed';
            setError(errorMsg);
            toast.error(errorMsg);
            console.error('Wallet error:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validation
        if (!isWalletConnected) {
            const errorMsg = 'Please connect your wallet first';
            setError(errorMsg);
            toast.error(errorMsg);
            setIsLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            const errorMsg = 'Passwords do not match';
            setError(errorMsg);
            toast.error(errorMsg);
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            const errorMsg = 'Password must be at least 6 characters';
            setError(errorMsg);
            toast.error(errorMsg);
            setIsLoading(false);
            return;
        }

        try {
            toast.info('Creating your account... ⏳');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    walletAddress: walletAddress
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
                
                toast.success(`Welcome to MyCoin, ${data.user.username}! 🎉 Your wallet is now linked!`);
                
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);
            } else {
                setError(data.error || 'Registration failed');
                toast.error(data.error || 'Registration failed');
            }
        } catch (error) {
            const errorMsg = 'Network error. Please try again.';
            setError(errorMsg);
            toast.error(errorMsg);
            console.error('Registration error:', error);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center">
            <Head>
                <title>Register - MyCoin</title>
            </Head>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        My<span className="text-yellow-400">Coin</span>
                    </h1>
                    <p className="text-gray-300">Create your account</p>
                </div>

                {error && (
                    <div className="bg-red-600 text-white p-3 rounded-lg mb-4 flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={() => setError('')} className="text-xl">×</button>
                    </div>
                )}

                {/* Wallet Connection Step */}
                <div className="mb-6">
                    <label className="block text-gray-300 mb-2">Step 1: Connect Wallet</label>
                    {isWalletConnected ? (
                        <div className="bg-green-600/20 border border-green-600 rounded-lg p-3">
                            <p className="text-green-400 text-sm">✅ Wallet Connected</p>
                            <p className="text-gray-300 text-xs mt-1 break-all">
                                {walletAddress}
                            </p>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={connectWallet}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                        >
                            🦊 Connect MetaMask
                        </button>
                    )}
                </div>

                {/* Registration Form */}
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 mb-2">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            minLength="3"
                            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="Choose a username"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="your.email@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="Choose a strong password"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="Confirm your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !isWalletConnected}
                        className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-600 text-black font-bold py-3 px-6 rounded-lg transition duration-300"
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-gray-300">
                        Already have an account?{' '}
                        <Link href="/login" className="text-yellow-400 hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>

                <div className="text-center mt-4">
                    <Link href="/" className="text-blue-400 hover:underline">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}