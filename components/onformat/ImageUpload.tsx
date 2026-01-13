import React, { useRef, useState } from 'react';
import { GlassButton } from '@/components/ui/GlassButton';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    className?: string;
    placeholder?: React.ReactNode;
    isLocked?: boolean;
}

export const ImageUpload = ({ value, onChange, className = '', placeholder, isLocked }: ImageUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            onChange(url);
        }
    };

    const handleUploadClick = () => {
        if (!isLocked) fileInputRef.current?.click();
    };

    // View Mode (Locked or Has Image)
    if (value) {
        return (
            <div className={`relative group ${className}`}>
                <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
                {!isLocked && (
                    <div
                        onClick={handleUploadClick}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                        <span className="text-white text-xs font-bold uppercase tracking-widest border-b border-white">Change Image</span>
                    </div>
                )}
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
            </div>
        );
    }

    // Empty Locked Mode
    if (isLocked) {
        return (
            <div className={`flex items-center justify-center bg-zinc-100 ${className}`}>
                <span className="text-zinc-300 text-xs font-bold uppercase">No Image</span>
            </div>
        );
    }

    // Upload Mode
    return (
        <div
            className={`flex flex-col items-center justify-center border-2 border-dashed transition-colors cursor-pointer ${isDragging ? 'bg-blue-50 border-blue-400' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100'} ${className}`}
            onClick={handleUploadClick}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
            }}
        >
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {placeholder || (
                <>
                    <span className="text-2xl mb-2 text-zinc-300">image</span>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Upload</span>
                </>
            )}
        </div>
    );
};
