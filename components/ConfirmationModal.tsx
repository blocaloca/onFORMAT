import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
}

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }: ConfirmationModalProps) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 rounded-md shadow-2xl w-[260px] border border-zinc-100 transform scale-100 animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="text-[11px] font-bold uppercase text-center mb-6 text-zinc-800 tracking-widest leading-relaxed">
                    {message}
                </div>
                <div className="flex justify-center gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-sm transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white bg-zinc-900 hover:bg-black rounded-sm transition-all shadow-sm"
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
};
