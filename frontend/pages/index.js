import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const toast = useToast();

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('authToken');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setIsLoggedIn(false);
        toast.success('Logged out successfully! 👋');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
            <Head>
                <title>MyCoin - Your First Cryptocurrency</title>
                <meta name="description" content="Create and manage your own cryptocurrency" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {/* Navigation */}
            <nav className="absolute top-0 right-0 p-6">
                <div className="flex space-x-4">
                    {isLoggedIn ? (
                        <>
                            <Link href="/dashboard">
                                <button className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded-lg transition duration-300">
                                    Dashboard
                                </button>
                            </Link>
                            <button 
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                                    Login
                                </button>
                            </Link>
                            <Link href="/register">
                                <button className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded-lg transition duration-300">
                                    Register
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            <main className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-6xl font-bold text-white mb-6">
                        My<span className="text-yellow-400">Coin</span>
                    </h1>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Apna pehla cryptocurrency project! ERC-20 token create karo, 
                        transactions karo aur blockchain technology seekho.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {isLoggedIn ? (
                            <Link href="/dashboard">
                                <button className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-8 rounded-lg transition duration-300">
                                    Go to Dashboard
                                </button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/register">
                                    <button className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-8 rounded-lg transition duration-300">
                                        Get Started
                                    </button>
                                </Link>
                                <Link href="/login">
                                    <button className="bg-transparent border-2 border-white hover:bg-white hover:text-black text-white font-bold py-3 px-8 rounded-lg transition duration-300">
                                        Login
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Rest of the existing content */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                        <h3 className="text-xl font-bold text-white mb-4">🪙 Create Token</h3>
                        <p className="text-gray-300">
                            Apna ERC-20 token create karo Sepolia testnet par. 
                            Smart contract deploy karo aur token mint karo.
                        </p>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                        <h3 className="text-xl font-bold text-white mb-4">💸 Transfer Tokens</h3>
                        <p className="text-gray-300">
                            Dusre wallets ko tokens send karo. Transaction history 
                            track karo aur balance check karo.
                        </p>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                        <h3 className="text-xl font-bold text-white mb-4">📊 Track Analytics</h3>
                        <p className="text-gray-300">
                            Token analytics dekho, transaction volume monitor karo 
                            aur user growth track karo.
                        </p>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
                    <h2 className="text-3xl font-bold text-white mb-6 text-center">Project Features</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-lg font-semibold text-yellow-400 mb-2">Frontend (Next.js)</h4>
                            <ul className="text-gray-300 space-y-1">
                                <li>• Modern React-based UI</li>
                                <li>• User Authentication</li>
                                <li>• Wallet integration</li>
                                <li>• Real-time updates</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-yellow-400 mb-2">Backend (Node.js)</h4>
                            <ul className="text-gray-300 space-y-1">
                                <li>• Express.js API</li>
                                <li>• MongoDB database</li>
                                <li>• JWT authentication</li>
                                <li>• Transaction logging</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-yellow-400 mb-2">Blockchain (Solidity)</h4>
                            <ul className="text-gray-300 space-y-1">
                                <li>• ERC-20 token standard</li>
                                <li>• Smart contract security</li>
                                <li>• Sepolia testnet deployment</li>
                                <li>• Gas optimization</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-yellow-400 mb-2">User Features</h4>
                            <ul className="text-gray-300 space-y-1">
                                <li>• User registration</li>
                                <li>• Secure authentication</li>
                                <li>• Transaction history</li>
                                <li>• Profile management</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}