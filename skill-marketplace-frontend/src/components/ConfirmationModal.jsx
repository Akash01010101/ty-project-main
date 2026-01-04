import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    showTerms = true
}) => {
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);

    const handleConfirm = () => {
        if (showTerms && !isTermsAccepted) return;
        onConfirm();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 50, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            borderColor: 'var(--border-color)',
                        }}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-2">
                                    <div className="p-2 rounded-full bg-yellow-500/10">
                                        <AlertCircle className="w-6 h-6 text-yellow-500" />
                                    </div>
                                    <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                        {title}
                                    </h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                    {message}
                                </p>
                            </div>

                            {showTerms && (
                                <div className="mb-6 p-4 rounded-lg bg-opacity-50" style={{ backgroundColor: 'var(--bg-primary)' }}>
                                    <label className="flex items-start cursor-pointer space-x-3">
                                        <div className="relative flex items-center pt-0.5">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 transition-colors"
                                                checked={isTermsAccepted}
                                                onChange={(e) => setIsTermsAccepted(e.target.checked)}
                                            />
                                        </div>
                                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            I agree to the <Link to="/terms" target="_blank" className="font-medium underline hover:text-green-500" style={{ color: 'var(--text-primary)' }}>Terms of Conditions</Link> and <Link to="/privacy" target="_blank" className="font-medium underline hover:text-green-500" style={{ color: 'var(--text-primary)' }}>Privacy Policy</Link>.
                                        </span>
                                    </label>
                                </div>
                            )}

                            <div className="flex space-x-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg border transition-all duration-200"
                                    style={{
                                        color: 'var(--text-secondary)',
                                        borderColor: 'var(--border-color)',
                                        backgroundColor: 'transparent',
                                    }}
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={showTerms && !isTermsAccepted}
                                    className={`flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-lg transition-all duration-200 ${showTerms && !isTermsAccepted
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:opacity-90 active:scale-[0.98]'
                                        }`}
                                    style={{ backgroundColor: 'var(--button-primary)' }}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
