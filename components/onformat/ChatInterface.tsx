import React, { useRef, useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

interface ChatMsg {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatInterfaceProps {
    messages: ChatMsg[];
    input: string;
    isSending: boolean;
    error: string | null;
    onInputChange: (val: string) => void;
    onSend: () => void;
    onInsertToDraft: (text: string) => void;
    onClear: () => void;
    activeToolLabel: string;
    activeToolKey: string;
    isLocked: boolean;
    activePhase: string;
    persona: 'STILLS' | 'MOTION' | 'HYBRID';
    isDocked?: boolean;
    onDock?: () => void;
    activeMode: 'OFF' | 'ASSIST' | 'DEVELOP';
    onModeChange: (m: 'OFF' | 'ASSIST' | 'DEVELOP') => void;
    onCreateBrief?: (text: string) => void;
}

export const ChatInterface = ({
    messages,
    input,
    isSending,
    error,
    onInputChange,
    onSend,
    onInsertToDraft,
    onClear,
    activeToolLabel,
    activeToolKey,
    isLocked,
    activePhase,
    persona,
    isDocked,
    onDock,
    activeMode,
    onModeChange,
    onCreateBrief
}: ChatInterfaceProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // -- Floating Window State --
    // Safe initialization for SSR
    const [position, setPosition] = useState({ x: 800, y: 100 });
    const [size, setSize] = useState({ w: 500, h: 600 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const resizeStart = useRef({ w: 0, h: 0, x: 0, y: 0 });

    useEffect(() => {
        // Initial Position Check -- Move to proper side of screen on mount (Right of Nav = ~280px)
        if (typeof window !== 'undefined') {
            setPosition(prev => ({ ...prev, x: 280 }));
        }
    }, []);

    useEffect(() => {
        // Validation to ensure it's on screen
        if (typeof window !== 'undefined' && position.x > window.innerWidth - 100) {
            setPosition({ x: window.innerWidth - 450, y: 100 });
        }
    }, [position.x]);

    useEffect(() => {
        // Prevent text selection while dragging/resizing
        if (isDragging || isResizing) {
            document.body.style.userSelect = 'none';
            document.body.style.cursor = isDragging ? 'move' : 'nwse-resize';
        } else {
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        }
    }, [isDragging, isResizing]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (isDragging) {
            const handleMouseMove = (e: MouseEvent) => {
                setPosition({
                    x: e.clientX - dragOffset.current.x,
                    y: e.clientY - dragOffset.current.y
                });
            };
            const handleMouseUp = () => setIsDragging(false);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging]);

    useEffect(() => {
        if (isResizing) {
            const handleMouseMove = (e: MouseEvent) => {
                setSize({
                    w: Math.max(300, resizeStart.current.w + (e.clientX - resizeStart.current.x)),
                    h: Math.max(200, resizeStart.current.h + (e.clientY - resizeStart.current.y))
                });
            };
            const handleMouseUp = () => setIsResizing(false);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isResizing]);

    const startDrag = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    const startResize = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsResizing(true);
        resizeStart.current = {
            w: size.w,
            h: size.h,
            x: e.clientX,
            y: e.clientY
        };
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    // -- Mode Switch --
    const handleModeSwitch = (mode: 'OFF' | 'ASSIST' | 'DEVELOP') => {
        console.log('Switching Mode:', mode);
        // Project Vision only supports DEVELOP/OFF (per user rules)
        if (activeToolKey === 'project-vision' && mode === 'ASSIST') return;

        if (mode === 'OFF') {
            onDock?.();
        }
        if (onModeChange) {
            onModeChange(mode);
        } else {
            console.error('onModeChange is missing!');
        }
    };

    // Force DEVELOP mode for Project Vision if currently in ASSIST
    useEffect(() => {
        if (activeToolKey === 'project-vision' && activeMode === 'ASSIST') {
            onModeChange('DEVELOP');
        }
    }, [activeToolKey, activeMode, onModeChange]);

    if (isDocked) return null;

    return (
        <section
            className="fixed bg-white shadow-2xl flex flex-col border border-zinc-300 rounded-lg overflow-hidden z-50"
            style={{
                left: position.x,
                top: position.y,
                width: size.w,
                height: size.h
            }}
        >
            {/* Header / Drag Handle */}
            <div
                className="p-3 bg-zinc-900 flex justify-between items-center cursor-move select-none"
                onMouseDown={startDrag}
            >
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white tracking-widest">AI LIAISON</span>
                    <span className="text-[9px] text-zinc-500 font-mono pl-2 border-l border-zinc-700">
                        {activeMode} // {activePhase} // {(activeToolLabel || '').toUpperCase()}
                    </span>
                </div>

                {/* Control Buttons (OFF | ASSIST | DEVELOP) */}
                <button
                    onClick={() => handleModeSwitch('OFF')}
                    className="ml-auto px-3 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-[9px] font-bold text-zinc-400 hover:text-white rounded-sm transition-colors uppercase tracking-widest"
                >
                    Disable AI
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-white" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-sm text-center">
                        <p className="text-zinc-400 text-[10px] uppercase tracking-wide">Ready to assist with {activePhase}</p>
                    </div>
                )}

                {messages.map((m, i) => {
                    const isProjectVision = activeToolKey === 'project-vision';
                    const displayContent = m.content
                        .replace('[BRIEF_READY]', '')
                        .replace('[TREATMENT_READY]', '')
                        .trim();

                    // Project Vision: Split paragraphs for Assistant
                    if (isProjectVision && m.role === 'assistant') {
                        const paragraphs = displayContent.split(/\n\n+/).filter(p => p.trim().length > 0);
                        return (
                            <div key={i} className="flex flex-col items-start gap-4">
                                {paragraphs.map((para, pIdx) => (
                                    <div key={`${i}-${pIdx}`} className="p-3 rounded-md text-xs leading-relaxed max-w-[90%] shadow-sm bg-white text-zinc-800 border-l-2 border-l-black pl-3">
                                        <div className="whitespace-pre-wrap font-sans">{para.trim()}</div>
                                        {!isLocked && (
                                            <button
                                                onClick={() => onInsertToDraft(para.trim())}
                                                className="mt-2 text-[10px] font-bold text-industrial-accent hover:text-black flex items-center gap-1 uppercase tracking-tight transition-colors"
                                            >
                                                <span>+ Add to Vision</span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        );
                    }

                    // Standard Logic for other tools / User Messages
                    const hasDraftContent = isProjectVision || m.content.includes('**') || m.content.includes('[BRIEF_READY]') || m.content.includes('[TREATMENT_READY]');
                    const showButton = m.role === 'assistant' && !isLocked && hasDraftContent && activeToolKey !== 'projects';
                    const contentToInsert = displayContent.split('---')[0].trim();

                    return (
                        <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div
                                className={`
                    p-3 rounded-md text-xs leading-relaxed max-w-[90%] shadow-sm
                    ${m.role === 'user'
                                        ? 'bg-zinc-100 text-black border border-zinc-200'
                                        : 'bg-white text-zinc-800 border-l-2 border-l-black pl-3'
                                    }
                `}
                            >
                                <div className="whitespace-pre-wrap font-sans">{displayContent}</div>

                                {showButton && (
                                    <button
                                        onClick={() => onInsertToDraft(contentToInsert)}
                                        className="mt-2 text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase tracking-tight"
                                    >
                                        <span>+ Add to Brief</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {isSending && (
                    <div className="flex items-center gap-2 text-xs text-zinc-400 pl-2">
                        <span>Thinking...</span>
                    </div>
                )}

                {error && (
                    <div className="p-2 bg-red-50 text-red-500 text-xs border border-red-100">
                        {error}
                    </div>
                )}
            </div>

            {/* Input Area (Bottom) */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-200">
                <div className="flex gap-0 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            activeToolKey === 'brief' ? (activeMode === 'DEVELOP' ? 'Confirm or edit...' : 'Objective?') :
                                activeToolKey === 'directors-treatment' ? (activeMode === 'DEVELOP' ? 'Confirm or edit...' : 'Narrative Arc?') :
                                    `Ask for ideas...`
                        }
                        disabled={isLocked || isSending}
                        className="w-full bg-white border border-zinc-300 p-3 pr-24 text-xs text-black focus:outline-none focus:border-black placeholder-zinc-400 disabled:opacity-50 rounded-sm shadow-inner"
                    />
                    <div className="absolute right-2 top-2 flex gap-2">
                        <button
                            onClick={onSend}
                            disabled={!input.trim() || isSending}
                            className={`w-8 h-8 rounded-sm transition-colors flex items-center justify-center ${!input.trim() || isSending ? 'bg-zinc-100 text-zinc-300' : 'bg-black text-white hover:bg-zinc-800'}`}
                        >
                            <ArrowUp size={14} />
                        </button>
                        <button onClick={onClear} className="h-8 px-2 text-[10px] text-zinc-300 hover:text-red-500 uppercase font-bold flex items-center" title="Clear">
                            CLR
                        </button>
                    </div>
                </div>
            </div>

            {/* Resize Handle */}
            <div
                className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50 flex items-end justify-end p-0.5"
                onMouseDown={startResize}
            >
                <div className="w-2 h-2 border-b-2 border-r-2 border-zinc-300 hover:border-zinc-500 transition-colors"></div>
            </div>
        </section>
    );
};
