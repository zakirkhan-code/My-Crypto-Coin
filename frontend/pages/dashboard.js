import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import WalletConnect from '../components/WalletConnect';
import { ethers } from 'ethers';
import { useToast } from '../context/ToastContext';

// Contract ABI (simplified for essential functions)
const TOKEN_ABI = [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_initialSupply",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Mint",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "mint",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
];

export default function Dashboard() {
    const router = useRouter();
    const toast = useToast();
    const [account, setAccount] = useState('');
    const [balance, setBalance] = useState('0');
    const [tokenBalance, setTokenBalance] = useState('0');
    const [contract, setContract] = useState(null);
    const [provider, setProvider] = useState(null);
    const [recipientAddress, setRecipientAddress] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [tokenInfo, setTokenInfo] = useState({
        name: '',
        symbol: '',
        totalSupply: '0'
    });
    const [userData, setUserData] = useState(null);

    // Contract address (environment variable se aayega after deployment)
    const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    // Authentication and user data loading
    useEffect(() => {
        checkAuthentication();
    }, []);
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            setTimeout(() => {
                toast.info('Dashboard loaded successfully! 🎉');
            }, 1000);
        }
    }, []);

    // Load token data when account and provider are available
    useEffect(() => {
        if (account && provider) {
            loadTokenData();
            loadTransactionHistory();
        }
    }, [account, provider]);

    const checkAuthentication = () => {
        // Check if user is logged in
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast.error('Please login first! 🔐');
            setTimeout(() => {
                router.push('/login');
            }, 1000);
            return;
        }

        // Load user data
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
            const user = JSON.parse(userDataString);
            setUserData(user);
            console.log('Logged in user:', user);
        }
    };

    const loadTokenData = async () => {
        try {
            if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "demo") {
                console.log('Running in demo mode - no contract deployed');
                
                // Demo data set karo
                setTokenInfo({
                    name: 'MyCoin Token (Demo)',
                    symbol: 'MYC',
                    totalSupply: '1000000'
                });
                
                setTokenBalance('1000'); // Demo balance
                
                // ETH balance load karo
                const ethBalance = await provider.getBalance(account);
                setBalance(ethers.utils.formatEther(ethBalance));
                
                return;
            }

            const tokenContract = new ethers.Contract(CONTRACT_ADDRESS, TOKEN_ABI, provider);
            setContract(tokenContract);

            // Token info load karo
            const name = await tokenContract.name();
            const symbol = await tokenContract.symbol();
            const totalSupply = await tokenContract.totalSupply();
            const decimals = await tokenContract.decimals();

            setTokenInfo({
                name,
                symbol,
                totalSupply: ethers.utils.formatUnits(totalSupply, decimals)
            });

            // User ka token balance load karo
            const tokenBalance = await tokenContract.balanceOf(account);
            setTokenBalance(ethers.utils.formatUnits(tokenBalance, decimals));

            // ETH balance load karo
            const ethBalance = await provider.getBalance(account);
            setBalance(ethers.utils.formatEther(ethBalance));

        } catch (error) {
            console.error('Error loading token data:', error);
            toast.error('Failed to load token data 😞');
        }
    };

    const loadTransactionHistory = async () => {
        try {
            // API se transaction history load karo
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTransactions(data);
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    };

    const handleTransfer = async () => {
        if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "demo") {
            toast.warning('Demo mode: Contract not deployed yet. Deploy contract to enable real transfers. ⚠️');
            return;
        }

        if (!contract || !recipientAddress || !transferAmount) {
            toast.error('Please fill all fields 📝');
            return;
        }

        setIsLoading(true);
        try {
            const signer = provider.getSigner();
            const contractWithSigner = contract.connect(signer);

            // Transfer amount ko wei mein convert karo
            const decimals = await contract.decimals();
            const amount = ethers.utils.parseUnits(transferAmount, decimals);

            // Transaction send karo
            const tx = await contractWithSigner.transfer(recipientAddress, amount);
            
            console.log('Transaction sent:', tx.hash);
            toast.info('Transaction sent! Waiting for confirmation... ⏳');
            
            // Transaction confirm hone ka wait karo
            await tx.wait();

            toast.success('Transfer successful! 🎉 Transaction confirmed!');

            // Transaction API mein save karo
            await saveTransaction({
                type: 'send',
                amount: parseFloat(transferAmount),
                fromAddress: account,
                toAddress: recipientAddress,
                txHash: tx.hash
            });

            // Form reset karo aur data reload karo
            setRecipientAddress('');
            setTransferAmount('');
            loadTokenData();
            loadTransactionHistory();

        } catch (error) {
            console.error('Transfer error:', error);
            toast.error(`Transfer failed: ${error.message} 😞`);
        }
        setIsLoading(false);
    };

    const saveTransaction = async (transactionData) => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(transactionData)
            });
        } catch (error) {
            console.error('Error saving transaction:', error);
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

    const formatAddress = (address) => {
        if (!address) return 'N/A';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900">
            <Head>
                <title>Dashboard - MyCoin</title>
            </Head>

            <div className="container mx-auto px-4 py-8">
                 {/* Quick Toast Test Buttons in Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-white">MyCoin Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        {/* Add quick test buttons */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => toast.success('Test Success! 🎉')}
                                    className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded text-xs"
                                >
                                    ✅
                                </button>
                                <button
                                    onClick={() => toast.error('Test Error! 😞')}
                                    className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-xs"
                                >
                                    ❌
                                </button>
                                <button
                                    onClick={() => toast.warning('Test Warning! ⚠️')}
                                    className="bg-yellow-600 hover:bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                                >
                                    ⚠️
                                </button>
                                <button
                                    onClick={() => toast.info('Test Info! ℹ️')}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs"
                                >
                                    ℹ️
                                </button>
                            </div>
                        )}
                        
                        {/* Your existing header buttons */}
                        <Link href="/profile">
                            <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition duration-300">
                                👤 Profile
                            </button>
                        </Link>
                        
                        <button
                            onClick={() => {
                                localStorage.removeItem('authToken');
                                localStorage.removeItem('userData');
                                toast.success('Logged out successfully! See you soon! 👋');
                                setTimeout(() => {
                                    router.push('/');
                                }, 1000);
                            }}
                            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition duration-300"
                        >
                            🚪 Logout
                        </button>
                        
                        <WalletConnect 
                            onAccountChange={setAccount}
                            onProviderChange={setProvider}
                        />
                    </div>
                </div>

                {account ? (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Balance Cards */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-300 mb-2">
                                        ETH Balance
                                    </h3>
                                    <p className="text-3xl font-bold text-white">
                                        {parseFloat(balance).toFixed(4)} ETH
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Sepolia Testnet
                                    </p>
                                </div>

                                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-300 mb-2">
                                        {tokenInfo.symbol || 'MYC'} Balance
                                    </h3>
                                    <p className="text-3xl font-bold text-yellow-400">
                                        {parseFloat(tokenBalance).toFixed(2)} {tokenInfo.symbol || 'MYC'}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {CONTRACT_ADDRESS === "demo" || !CONTRACT_ADDRESS ? 'Demo Mode' : 'Live Contract'}
                                    </p>
                                </div>
                            </div>

                            {/* Token Transfer */}
                            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                                <h3 className="text-xl font-bold text-white mb-4">
                                    Send {tokenInfo.symbol || 'MYC'} Tokens
                                </h3>
                                
                                {(!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "demo") && (
                                    <div className="bg-yellow-600/20 border border-yellow-600 rounded-lg p-4 mb-4">
                                        <p className="text-yellow-400 text-sm">
                                            ⚠️ Demo Mode: Deploy smart contract to enable real transfers
                                        </p>
                                    </div>
                                )}
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-300 mb-2">
                                            Recipient Address
                                        </label>
                                        <input
                                            type="text"
                                            value={recipientAddress}
                                            onChange={(e) => setRecipientAddress(e.target.value)}
                                            placeholder="0x..."
                                            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-2">
                                            Amount ({tokenInfo.symbol || 'MYC'})
                                        </label>
                                        <input
                                            type="number"
                                            value={transferAmount}
                                            onChange={(e) => setTransferAmount(e.target.value)}
                                            placeholder="0.0"
                                            step="0.01"
                                            min="0"
                                            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        />
                                    </div>
                                    <button
                                        onClick={handleTransfer}
                                        disabled={isLoading}
                                        className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-600 text-black font-bold py-3 px-6 rounded-lg transition duration-300"
                                    >
                                        {isLoading ? 'Sending...' : `Send ${tokenInfo.symbol || 'MYC'}`}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Account Info */}
                            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Account Info</h3>
                                <div className="space-y-2">
                                    <p className="text-gray-300">
                                        <span className="font-semibold">Address:</span>
                                    </p>
                                    <p className="text-sm text-yellow-400 break-all font-mono">
                                        {account}
                                    </p>
                                    <p className="text-gray-300">
                                        <span className="font-semibold">Network:</span> Sepolia Testnet
                                    </p>
                                    {userData && (
                                        <p className="text-gray-300">
                                            <span className="font-semibold">User:</span> {userData.username}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Token Info */}
                            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Token Info</h3>
                                <div className="space-y-2">
                                    <p className="text-gray-300">
                                        <span className="font-semibold">Name:</span> {tokenInfo.name || 'MyCoin Token'}
                                    </p>
                                    <p className="text-gray-300">
                                        <span className="font-semibold">Symbol:</span> {tokenInfo.symbol || 'MYC'}
                                    </p>
                                    <p className="text-gray-300">
                                        <span className="font-semibold">Total Supply:</span> {parseFloat(tokenInfo.totalSupply).toLocaleString()}
                                    </p>
                                    {CONTRACT_ADDRESS && CONTRACT_ADDRESS !== "demo" && (
                                        <div className="mt-3">
                                            <p className="text-gray-300 text-xs">
                                                <span className="font-semibold">Contract:</span>
                                            </p>
                                            <p className="text-yellow-400 text-xs font-mono break-all">
                                                {CONTRACT_ADDRESS}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button 
                                        onClick={loadTokenData}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg transition duration-300"
                                    >
                                        🔄 Refresh Balance
                                    </button>
                                    <button 
                                        onClick={() => window.open(`https://sepolia.etherscan.io/address/${account}`, '_blank')}
                                        className="w-full bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-lg transition duration-300"
                                    >
                                        🔍 View on Etherscan
                                    </button>
                                    {CONTRACT_ADDRESS && CONTRACT_ADDRESS !== "demo" && (
                                        <button 
                                            onClick={() => window.open(`https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}`, '_blank')}
                                            className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 px-4 rounded-lg transition duration-300"
                                        >
                                            🪙 View Token Contract
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Transaction History */}
                        <div className="lg:col-span-3">
                            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Transaction History</h3>
                                {transactions.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-gray-600">
                                                    <th className="pb-2 text-gray-300">Type</th>
                                                    <th className="pb-2 text-gray-300">Amount</th>
                                                    <th className="pb-2 text-gray-300">From</th>
                                                    <th className="pb-2 text-gray-300">To</th>
                                                    <th className="pb-2 text-gray-300">Date</th>
                                                    <th className="pb-2 text-gray-300">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.slice(0, 10).map((tx, index) => (
                                                    <tr key={index} className="border-b border-gray-700">
                                                        <td className="py-2">
                                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                                tx.type === 'send' ? 'bg-red-600 text-white' : 
                                                                tx.type === 'receive' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                                                            }`}>
                                                                {tx.type === 'send' ? '📤 SEND' : 
                                                                 tx.type === 'receive' ? '📥 RECEIVE' : '💰 MINT'}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 text-white font-medium">
                                                            {tx.amount} {tokenInfo.symbol || 'MYC'}
                                                        </td>
                                                        <td className="py-2 text-gray-300">
                                                            <span className="font-mono text-xs">
                                                                {formatAddress(tx.fromAddress)}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 text-gray-300">
                                                            <span className="font-mono text-xs">
                                                                {formatAddress(tx.toAddress)}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 text-gray-300 text-sm">
                                                            {new Date(tx.timestamp).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </td>
                                                        <td className="py-2">
                                                            <span className="px-2 py-1 rounded text-xs bg-green-600 text-white">
                                                                ✅ Success
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400 mb-4">No transactions yet</p>
                                        <p className="text-gray-500 text-sm">Start by sending some tokens!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            Connect Your Wallet to Get Started
                        </h2>
                        <p className="text-gray-300 mb-8">
                            Please connect your MetaMask wallet to access the dashboard
                        </p>
                        {userData && (
                            <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4 max-w-md mx-auto">
                                <p className="text-blue-400 text-sm">
                                    Welcome back, {userData.username}! 👋
                                </p>
                                <p className="text-gray-300 text-sm mt-1">
                                    Connect your wallet to continue
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}