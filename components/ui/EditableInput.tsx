import React, { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';

interface EditableInputProps {
    value: string;
    onSave: (newValue: string) => void;
    isEditable: boolean;
    type?: 'text' | 'textarea';
    className?: string;
    placeholder?: string;
}

export function EditableInput({ value, onSave, isEditable, type = 'text', className = '', placeholder }: EditableInputProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);

    // Sync input when prop value changes outside
    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const handleSave = () => {
        setIsEditing(false);
        if (currentValue !== value) {
            onSave(currentValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && type !== 'textarea') {
            handleSave();
        }
        if (e.key === 'Escape') {
            setIsEditing(false);
            setCurrentValue(value);
        }
    };

    if (!isEditable) {
        return (
            <span className={className}>
                {value || placeholder || "TBD"}
            </span>
        );
    }

    if (isEditing) {
        return (
            <div className={`relative flex items-center w-full group ${className}`}>
                {type === 'textarea' ? (
                    <textarea
                        className="w-full bg-yellow-50/50 text-black border border-yellow-400 p-1.5 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] resize-none"
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        rows={3}
                    />
                ) : (
                    <input
                        className="w-full bg-yellow-50/50 text-black border border-yellow-400 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] text-inherit font-inherit"
                        type="text"
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                )}
            </div>
        );
    }

    return (
        <span
            className={`group relative cursor-pointer hover:bg-zinc-200/50 hover:px-1 -mx-1 rounded transition-all flex items-center ${className}`}
            onClick={() => setIsEditing(true)}
            title="Click to edit"
        >
            <span className="truncate">{value || placeholder || "Click to edit"}</span>
            <Edit2 size={12} className="text-zinc-400 opacity-0 group-hover:opacity-100 ml-2 shrink-0" />
        </span>
    );
}
