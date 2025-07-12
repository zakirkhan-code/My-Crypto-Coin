import { useState, useEffect } from 'react';

const Toast = ({ message, type, duration = 5000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLeaving(true);
            setTimeout(() => {
                setIsVisible(false);
                onClose();
            }, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getToastStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-600 border-l-4 border-green-400 text-white shadow-green-600/20';
            case 'error':
                return 'bg-red-600 border-l-4 border-red-400 text-white shadow-red-600/20';
            case 'warning':
                return 'bg-yellow-600 border-l-4 border-yellow-400 text-white shadow-yellow-600/20';
            case 'info':
                return 'bg-blue-600 border-l-4 border-blue-400 text-white shadow-blue-600/20';
            default:
                return 'bg-gray-600 border-l-4 border-gray-400 text-white shadow-gray-600/20';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '📢';
        }
    };

    if (!isVisible) return null;

    return (
        <div 
            className={`
                transform transition-all duration-300 ease-in-out
                ${isLeaving ? 'translate-x-full opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'}
                w-full max-w-sm
            `}
            style={{ zIndex: 9999 }}
        >
            <div className={`
                ${getToastStyles()}
                rounded-lg shadow-2xl p-4 mb-3
                flex items-start space-x-3
                backdrop-blur-lg
                min-h-[60px]
                border border-white/10
            `}>
                <div className="flex-shrink-0 mt-0.5">
                    <span className="text-xl">{getIcon()}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-relaxed break-words">
                        {message}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setIsLeaving(true);
                        setTimeout(() => {
                            setIsVisible(false);
                            onClose();
                        }, 300);
                    }}
                    className="flex-shrink-0 text-white/80 hover:text-white transition-colors ml-2 text-lg font-bold leading-none"
                    style={{ lineHeight: '1' }}
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default Toast;