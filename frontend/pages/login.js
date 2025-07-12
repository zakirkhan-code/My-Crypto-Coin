import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { useToast } from '../context/ToastContext';

export default function Login() {
    const [loginMethod, setLoginMethod] = useState('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const toast = useToast();

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
                
                toast.success(`Welcome back, ${data.user.username}! 🎉`);
                
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1000);
            } else {
                setError(data.error || 'Login failed');
                toast.error(data.error || 'Login failed 😞');
            }
        } catch (error) {
            const errorMsg = 'Network error. Please try again.';
            setError(errorMsg);
            toast.error(errorMsg);
            console.error('Login error:', error);
        }
        setIsLoading(false);
    };

    const handleWalletLogin = async () => {
        setIsLoading(true);
        setError('');

        try {
            if (typeof window.ethereum === 'undefined') {
                const errorMsg = 'MetaMask is not installed. Please install MetaMask first.';
                toast.error(errorMsg);
                setIsLoading(false);
                return;
            }

            toast.info('Connecting to MetaMask... 🦊');

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            const walletAddress = accounts[0];

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wallet-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ walletAddress }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
                
                toast.success(`Wallet login successful! Welcome ${data.user.username} 🚀`);
                
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1000);
            } else {
                setError(data.error || 'Wallet not registered');
                toast.error(data.error || 'Wallet not registered. Please register first.');
            }
        } catch (error) {
            const errorMsg = 'Wallet login failed. Please try again.';
            setError(errorMsg);
            toast.error(errorMsg);
            console.error('Wallet login error:', error);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center">
            <Head>
                <title>Login - MyCoin</title>
            </Head>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        My<span className="text-yellow-400">Coin</span>
                    </h1>
                    <p className="text-gray-300">Login to your account</p>
                </div>

                {error && (
                    <div className="bg-red-600 text-white p-3 rounded-lg mb-4 flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={() => setError('')} className="text-xl">×</button>
                    </div>
                )}

                {/* Login Method Selector */}
                <div className="flex mb-6">
                    <button
                        onClick={() => setLoginMethod('email')}
                        className={`flex-1 py-2 px-4 rounded-l-lg font-medium transition duration-300 ${
                            loginMethod === 'email'
                                ? 'bg-yellow-400 text-black'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        📧 Email/Password
                    </button>
                    <button
                        onClick={() => setLoginMethod('wallet')}
                        className={`flex-1 py-2 px-4 rounded-r-lg font-medium transition duration-300 ${
                            loginMethod === 'wallet'
                                ? 'bg-yellow-400 text-black'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        🦊 Wallet
                    </button>
                </div>

                {/* Email/Password Login Form */}
                {loginMethod === 'email' && (
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div>
                            <label className="block text-gray-300 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-600 text-black font-bold py-3 px-6 rounded-lg transition duration-300"
                        >
                            {isLoading ? 'Logging in...' : 'Login with Email'}
                        </button>
                    </form>
                )}

                {/* Wallet Login */}
                {loginMethod === 'wallet' && (
                    <div className="space-y-4">
                        <div className="text-center">
                            <p className="text-gray-300 mb-4">
                                Connect your registered wallet to login instantly
                            </p>
                            <button
                                onClick={handleWalletLogin}
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center space-x-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Connecting...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🦊</span>
                                        <span>Connect & Login</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                <div className="text-center mt-6">
                    <p className="text-gray-300">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-yellow-400 hover:underline">
                            Register here
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