import React, { createContext, useContext, useState } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 5000) => {
        const id = Date.now() + Math.random();
        const newToast = { id, message, type, duration };
        
        setToasts(prev => [...prev, newToast]);
        
        // Auto remove after duration
        setTimeout(() => {
            removeToast(id);
        }, duration + 500); // Add extra time for animation
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // Convenience methods
    const toast = {
        success: (message, duration = 5000) => addToast(message, 'success', duration),
        error: (message, duration = 6000) => addToast(message, 'error', duration),
        warning: (message, duration = 5000) => addToast(message, 'warning', duration),
        info: (message, duration = 4000) => addToast(message, 'info', duration),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            
            {/* Toast Container with Better Positioning */}
            <div 
                className="fixed inset-0 pointer-events-none z-[9999] flex flex-col items-end justify-start"
                style={{ 
                    top: '20px', 
                    right: '20px', 
                    left: 'auto', 
                    bottom: 'auto',
                    width: 'auto',
                    height: 'auto'
                }}
            >
                <div className="flex flex-col space-y-2 pointer-events-auto w-full max-w-sm">
                    {toasts.map((toastItem, index) => (
                        <div
                            key={toastItem.id}
                            className="w-full"
                            style={{ 
                                zIndex: 9999 - index,
                                marginTop: index > 0 ? '8px' : '0'
                            }}
                        >
                            <Toast
                                message={toastItem.message}
                                type={toastItem.type}
                                duration={toastItem.duration}
                                onClose={() => removeToast(toastItem.id)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Toast Container */}
            <div className="md:hidden fixed inset-x-4 top-4 pointer-events-none z-[9999]">
                <div className="flex flex-col space-y-2 pointer-events-auto">
                    {toasts.map((toastItem, index) => (
                        <div
                            key={`mobile-${toastItem.id}`}
                            className="w-full"
                            style={{ 
                                zIndex: 9999 - index,
                                display: window.innerWidth < 768 ? 'block' : 'none'
                            }}
                        >
                            <Toast
                                message={toastItem.message}
                                type={toastItem.type}
                                duration={toastItem.duration}
                                onClose={() => removeToast(toastItem.id)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Debug: Toast Counter (Remove in production) */}
            {process.env.NODE_ENV === 'development' && toasts.length > 0 && (
                <div className="fixed bottom-4 left-4 bg-black/80 text-white px-2 py-1 rounded text-xs z-[10000]">
                    Toasts: {toasts.length}
                </div>
            )}
        </ToastContext.Provider>
    );
};