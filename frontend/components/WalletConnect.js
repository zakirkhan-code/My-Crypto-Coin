import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { useToast } from '../context/ToastContext';

export default function WalletConnect({ onAccountChange, onProviderChange }) {
    const [account, setAccount] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [chainId, setChainId] = useState('');
    const [authorizedAccount, setAuthorizedAccount] = useState('');
    const router = useRouter();
    const toast = useToast();

    // Sepolia testnet ki details
    const SEPOLIA_CHAIN_ID = '0xaa36a7';
    const SEPOLIA_NETWORK = {
        chainId: SEPOLIA_CHAIN_ID,
        chainName: 'Sepolia Testnet',
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
        },
        rpcUrls: ['https://sepolia.infura.io/v3/'],
        blockExplorerUrls: ['https://sepolia.etherscan.io/'],
    };

    useEffect(() => {
        checkIfWalletIsConnected();
        setupEventListeners();
        
        // Load authorized account from localStorage
        const userData = localStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            if (user.walletAddress) {
                setAuthorizedAccount(user.walletAddress.toLowerCase());
            }
        }
    }, []);

    const checkIfWalletIsConnected = async () => {
        try {
            if (typeof window.ethereum === 'undefined') {
                console.log('MetaMask is not installed');
                return;
            }

            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                const currentAccount = accounts[0].toLowerCase();
                
                // Check if current account matches authorized account
                const userData = localStorage.getItem('userData');
                if (userData) {
                    const user = JSON.parse(userData);
                    const userWallets = user.walletAddresses || [user.walletAddress];
                    
                    // Check if current account is in user's authorized wallets
                    const isAuthorized = userWallets.some(wallet => 
                        wallet && wallet.toLowerCase() === currentAccount
                    );
                    
                    if (!isAuthorized) {
                        handleUnauthorizedAccountChange();
                        return;
                    }
                }

                const provider = new ethers.providers.Web3Provider(window.ethereum);
                setAccount(accounts[0]);
                onAccountChange && onAccountChange(accounts[0]);
                onProviderChange && onProviderChange(provider);

                const network = await provider.getNetwork();
                setChainId('0x' + network.chainId.toString(16));
            }
        } catch (error) {
            console.error('Error checking wallet connection:', error);
        }
    };

    const handleUnauthorizedAccountChange = () => {
        toast.error('🚨 Security Alert: MetaMask account changed to unauthorized wallet! You are being logged out for security reasons. 🔒', 8000);
        
        // Clear all auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        // Reset states
        setAccount('');
        setAuthorizedAccount('');
        onAccountChange && onAccountChange('');
        onProviderChange && onProviderChange(null);
        
        setTimeout(() => {
            router.push('/login');
        }, 2000);
    };

    const setupEventListeners = () => {
        if (typeof window.ethereum === 'undefined') return;

        // Account change listener with security check
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
                const newAccount = accounts[0].toLowerCase();
                
                // Check if user is logged in
                const userData = localStorage.getItem('userData');
                if (userData) {
                    const user = JSON.parse(userData);
                    const userWallets = user.walletAddresses || [user.walletAddress];
                    
                    // Check if new account is authorized
                    const isAuthorized = userWallets.some(wallet => 
                        wallet && wallet.toLowerCase() === newAccount
                    );
                    
                    if (!isAuthorized) {
                        handleUnauthorizedAccountChange();
                        return;
                    }
                }
                
                setAccount(accounts[0]);
                onAccountChange && onAccountChange(accounts[0]);
            } else {
                setAccount('');
                onAccountChange && onAccountChange('');
            }
        });

        // Chain change listener
        window.ethereum.on('chainChanged', (chainId) => {
            setChainId(chainId);
            window.location.reload();
        });
    };

    const connectWallet = async () => {
        if (typeof window.ethereum === 'undefined') {
            toast.error('MetaMask is not installed. Please install MetaMask to continue. 🦊');
            window.open('https://metamask.io/download/', '_blank');
            return;
        }

        setIsConnecting(true);
        try {
            toast.info('Connecting to MetaMask... 🔗');

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const network = await provider.getNetwork();
            const currentChainId = '0x' + network.chainId.toString(16);

            if (currentChainId !== SEPOLIA_CHAIN_ID) {
                await switchToSepolia();
            }

            const connectedAccount = accounts[0].toLowerCase();
            
            const userData = localStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                const userWallets = user.walletAddresses || [user.walletAddress];
                
                const isAuthorized = userWallets.some(wallet => 
                    wallet && wallet.toLowerCase() === connectedAccount
                );
                
                if (!isAuthorized) {
                    const confirmed = confirm(
                        `This wallet (${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}) is not linked to your account.\n\nWould you like to add it to your profile?`
                    );
                    
                    if (confirmed) {
                        toast.info('Redirecting to profile page to add wallet... 📱');
                        router.push('/profile');
                        return;
                    } else {
                        toast.warning('Please connect an authorized wallet or add this wallet to your profile. 📱');
                        setIsConnecting(false);
                        return;
                    }
                }
            }

            setAccount(accounts[0]);
            setChainId(currentChainId);
            onAccountChange && onAccountChange(accounts[0]);
            onProviderChange && onProviderChange(provider);

            toast.success('Wallet connected successfully! ✅');

        } catch (error) {
            console.error('Error connecting wallet:', error);
            toast.error(`Failed to connect wallet: ${error.message} 😞`);
        }
        setIsConnecting(false);
    };

    const switchToSepolia = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: SEPOLIA_CHAIN_ID }],
            });
            toast.success('Switched to Sepolia network! 🔄');
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [SEPOLIA_NETWORK],
                    });
                    toast.success('Sepolia network added and activated! 🎉');
                } catch (addError) {
                    console.error('Error adding Sepolia network:', addError);
                    toast.error('Failed to add Sepolia network 😞');
                    throw new Error('Failed to add Sepolia network');
                }
            } else {
                console.error('Error switching to Sepolia:', switchError);
                toast.error('Failed to switch to Sepolia network 😞');
                throw new Error('Failed to switch to Sepolia network');
            }
        }
    };

    const disconnectWallet = () => {
        setAccount('');
        setChainId('');
        setAuthorizedAccount('');
        onAccountChange && onAccountChange('');
        onProviderChange && onProviderChange(null);
        toast.info('Wallet disconnected 👋');
    };

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const getNetworkName = (chainId) => {
        switch (chainId) {
            case SEPOLIA_CHAIN_ID:
                return 'Sepolia';
            case '0x1':
                return 'Mainnet';
            case '0x89':
                return 'Polygon';
            default:
                return 'Unknown';
        }
    };

    return (
        <div className="flex items-center space-x-4">
            {account ? (
                <div className="flex items-center space-x-3">
                    {/* Security Status */}
                    <div className="px-2 py-1 rounded text-xs bg-green-600 text-white">
                        🔒 Authorized
                    </div>
                    
                    {/* Network Indicator */}
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        chainId === SEPOLIA_CHAIN_ID 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                    }`}>
                        {getNetworkName(chainId)}
                    </div>

                    {/* Account Info */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            <span className="text-white font-medium">
                                {formatAddress(account)}
                            </span>
                        </div>
                    </div>

                    {/* Disconnect Button */}
                    <button
                        onClick={disconnectWallet}
                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition duration-300"
                    >
                        Disconnect
                    </button>
                </div>
            ) : (
                <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-600 text-black font-bold px-6 py-2 rounded-lg transition duration-300 flex items-center space-x-2"
                >
                    {isConnecting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                            <span>Connecting...</span>
                        </>
                    ) : (
                        <>
                            <span>🦊</span>
                            <span>Connect Wallet</span>
                        </>
                    )}
                </button>
            )}

            {/* Wrong Network Warning */}
            {account && chainId !== SEPOLIA_CHAIN_ID && (
                <div className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm">
                    ⚠️ Switch to Sepolia
                </div>
            )}
        </div>
    );
}