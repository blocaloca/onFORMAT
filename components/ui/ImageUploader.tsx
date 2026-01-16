import React, { useState, useRef } from 'react';
import { uploadImage, deleteImage } from '@/lib/upload-image';

interface ImageUploaderProps {
    currentUrl?: string;
    onUpload: (url: string) => void;
    className?: string;
    placeholderText?: string;
    placeholder?: React.ReactNode;
    isLocked?: boolean;
}

export const ImageUploader = ({ currentUrl, onUpload, className = '', placeholderText = 'Upload Image', placeholder, isLocked = false }: ImageUploaderProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLocked) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (isLocked) return;

        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = async (file: File) => {
        setIsUploading(true);
        setError(null);

        try {
            const url = await uploadImage(file);
            onUpload(url);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleClick = () => {
        if (!isUploading && !isLocked) {
            fileInputRef.current?.click();
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUrl) return;

        if (!confirm('Are you sure you want to delete this image?')) return;

        setIsUploading(true);
        try {
            await deleteImage(currentUrl);
            onUpload('');
        } catch (err) {
            console.error(err);
            setError('Failed to delete image');
        } finally {
            setIsUploading(false);
        }
    };


    return (
        <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative group ${isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'} overflow-hidden flex items-center justify-center bg-gray-100 border-2 border-dashed ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} ${isLocked ? '' : 'hover:border-black'} transition-colors ${className}`}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            {/* Content Layer */}
            {currentUrl ? (
                <>
                    <div
                        className="w-full h-full"
                        style={{
                            backgroundImage: `url(${currentUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            width: '100%',
                            height: '100%'
                        }}
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="text-white text-xs font-bold uppercase tracking-wider border border-white px-3 py-1 hover:bg-white hover:text-black transition-colors">
                            {isUploading ? '...' : 'Replace'}
                        </span>
                        <button
                            onClick={handleDelete}
                            className="text-red-500 text-xs font-bold uppercase tracking-wider border border-red-500 px-3 py-1 hover:bg-red-500 hover:text-white transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </>
            ) : (
                <div className="text-center p-4">
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] font-bold uppercase text-gray-400">Uploading...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-300 group-hover:text-black transition-colors">
                            {placeholder || (
                                <>
                                    <span className="text-2xl">📷</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{placeholderText}</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Error Toast inside container */}
            {error && (
                <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-[10px] p-1 text-center font-bold">
                    {error}
                </div>
            )}
        </div>
    );
};
