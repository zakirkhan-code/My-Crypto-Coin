import { useToast } from '../context/ToastContext';

// Test component - Add this to any page for testing
export default function ToastTest() {
    const toast = useToast();

    const testMessages = {
        success: [
            'Registration successful! 🎉',
            'Wallet connected successfully! ✅',
            'Transaction completed! 🚀',
            'Profile updated! 👤'
        ],
        error: [
            'Login failed! Please try again 😞',
            'Network error occurred 🌐',
            'Invalid wallet address 📱',
            'Transaction failed! ❌'
        ],
        warning: [
            'Please connect your wallet first ⚠️',
            'Demo mode is active 🧪',
            'You must have at least one wallet 📱',
            'Security alert! Unauthorized access 🔒'
        ],
        info: [
            'Connecting to MetaMask... 🦊',
            'Loading transaction data... ⏳',
            'Processing your request... 🔄',
            'Checking wallet permissions... 🔍'
        ]
    };

    const showRandomToast = (type) => {
        const messages = testMessages[type];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        toast[type](randomMessage);
    };

    return (
        <div className="fixed bottom-4 left-4 bg-white/10 backdrop-blur-lg rounded-lg p-4 space-y-2 z-[10000]">
            <h3 className="text-white font-semibold text-sm mb-3">Toast Tester 🧪</h3>
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => showRandomToast('success')}
                    className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded text-xs transition-all duration-200"
                >
                    ✅ Success
                </button>
                <button
                    onClick={() => showRandomToast('error')}
                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded text-xs transition-all duration-200"
                >
                    ❌ Error
                </button>
                <button
                    onClick={() => showRandomToast('warning')}
                    className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-2 rounded text-xs transition-all duration-200"
                >
                    ⚠️ Warning
                </button>
                <button
                    onClick={() => showRandomToast('info')}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-xs transition-all duration-200"
                >
                    ℹ️ Info
                </button>
            </div>
            <button
                onClick={() => {
                    showRandomToast('success');
                    setTimeout(() => showRandomToast('error'), 500);
                    setTimeout(() => showRandomToast('warning'), 1000);
                    setTimeout(() => showRandomToast('info'), 1500);
                }}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded text-xs transition-all duration-200"
            >
                🎪 Test All
            </button>
        </div>
    );
}