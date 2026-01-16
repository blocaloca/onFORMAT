import React, { useRef, useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';


interface AIAction {
    label: string;
    type: 'draft_prefill' | 'suggestion' | 'link';
    target?: string;
    payload?: any;
    prominence: 'primary' | 'secondary';
}

interface ChatMsg {
    role: 'user' | 'assistant';
    content: string;
    actions?: AIAction[];
}

// ... (ActionDeck Component Definition)
const ActionDeck = ({ actions, onAction }: { actions: AIAction[], onAction: (action: AIAction) => void }) => {
    const primary = actions.find(a => a.prominence === 'primary');
    const secondaries = actions.filter(a => a.prominence === 'secondary');

    if (actions.length === 0) return null;

    return (
        <div className="bg-zinc-50 border-t border-zinc-200 px-4 py-3 flex flex-col gap-3 animate-in slide-in-from-bottom-2 duration-200">
            {primary && (
                <button
                    onClick={() => onAction(primary)}
                    className="w-full bg-black text-white hover:bg-zinc-800 transition-colors py-3 px-4 rounded-sm flex items-center justify-between group shadow-sm"
                >
                    <span className="text-[11px] font-bold uppercase tracking-widest">{primary.label}</span>
                    <ArrowUp size={14} className="rotate-45 group-hover:rotate-90 transition-transform duration-300" />
                </button>
            )}

            {secondaries.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {secondaries.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={() => onAction(action)}
                            className="bg-white border border-zinc-300 hover:border-black hover:text-black text-zinc-500 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wide transition-colors"
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

interface ChatInterfaceProps {
    messages: ChatMsg[];
    input: string;
    isSending: boolean;
    error: string | null;
    onInputChange: (val: string) => void;
    onSend: (msg?: string) => void;
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
    onNavigate?: (tool: string) => void;
    placeholderHint?: string;
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
    onCreateBrief,
    onNavigate,
    placeholderHint
}: ChatInterfaceProps) => {
    // ... (refs and resizing/dragging state logic remain the same) 
    const scrollRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 800, y: 100 });
    const [size, setSize] = useState({ w: 500, h: 600 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const resizeStart = useRef({ w: 0, h: 0, x: 0, y: 0 });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPosition(prev => ({ ...prev, x: 280 }));
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && position.x > window.innerWidth - 100) {
            setPosition({ x: window.innerWidth - 450, y: 100 });
        }
    }, [position.x]);

    useEffect(() => {
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

    // Auto-Start Removed to prevent overriding Demo history or aggressive prompting.
    // The user or the Demo content should initiate.

    useEffect(() => {
        if (isDragging) {
            const handleMouseMove = (e: MouseEvent) => {
                setPosition({
                    x: e.clientX - dragOffset.current.x,
                    y: Math.max(0, e.clientY - dragOffset.current.y) // Clamp Y to 0 to prevent header burial
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

    const handleModeSwitch = (mode: 'OFF' | 'ASSIST' | 'DEVELOP') => {
        console.log('Switching Mode:', mode);
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

    useEffect(() => {
        if (activeToolKey === 'project-vision' && activeMode === 'ASSIST') {
            onModeChange('DEVELOP');
        }
    }, [activeToolKey, activeMode, onModeChange]);

    // Handle Actions
    const handleActionClick = (action: AIAction) => {
        // PRIORITY: Navigation
        if (action.target && onNavigate) {
            onNavigate(action.target);
            return;
        }

        if (!action.type || action.type === 'draft_prefill' || action.type === 'suggestion') {
            const payloadText = typeof action.payload === 'string' ? action.payload : JSON.stringify(action.payload);

            // 1. Insert into Document
            if (onInsertToDraft) {
                onInsertToDraft(payloadText);
            }

            // 2. Auto-Advance Conversation
            // We tell the AI what happened so it can ask the NEXT question.
            // We use a special marker or just clear text. 
            // The user doesn't need to type "I added it". We simulate it.
            // Note: We need to update the prop type of onSend to allow arguments if not already.
            // Looking at WorkspaceEditor, send(overrideInput) IS supported.
            // We send a message representing the user's choice to keep the flow.
            const userResponse = `I chose: ${action.label}. Content added: ${payloadText.substring(0, 50)}...`;
            onSend(userResponse);
        }
    };

    // Dynamic Placeholder Logic
    const lastMsg = messages[messages.length - 1];
    let hasActions = false;
    if (lastMsg?.role === 'assistant') {
        if (lastMsg.actions && lastMsg.actions.length > 0) hasActions = true;
        else if (lastMsg.content && lastMsg.content.includes('"actions":')) hasActions = true;
    }
    const dynamicPlaceholder = hasActions
        ? "Something else...?"
        : (placeholderHint || "Ask AI Liaison...");

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
                        {(activeToolLabel || '').toUpperCase()}
                    </span>
                </div>

                {/* 
                   User requested removal of "Disable AI". 
                   We can add a simple close/minimize icon if needed, but for now keeping it clean.
                   Maybe just a minimize icon?
                */}
                <button
                    onClick={onDock}
                    className="ml-auto text-zinc-500 hover:text-white transition-colors"
                    title="Minimize"
                >
                    <ArrowUp size={14} className="rotate-180" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-white" ref={scrollRef}>


                {messages.map((m: ChatMsg, i: number) => {
                    // Check if message content is JSON (Action Payload)
                    let textContent = m.content;
                    let inlineActions: AIAction[] = m.actions || [];

                    // Basic heuristic: check if it parses as our specific JSON format
                    if (m.role === 'assistant') {
                        try {
                            // Robust cleanup: remove markdown code blocks if present
                            const cleaned = m.content.replace(/```json\n?|```/g, '').trim();

                            if (cleaned.startsWith('{')) {
                                const parsed = JSON.parse(cleaned);
                                if (parsed.message) {
                                    textContent = parsed.message;
                                }
                                if (parsed.actions && Array.isArray(parsed.actions)) {
                                    inlineActions = parsed.actions;
                                }
                            }
                        } catch (e) {
                            // Not JSON, render as text
                        }
                    }

                    const displayContent = textContent
                        .replace('[BRIEF_READY]', '')
                        .replace('[TREATMENT_READY]', '')
                        .trim();

                    // Standard User/Assistant Render
                    return (
                        <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-[95%]`}>
                            <div
                                className={`
                    p-3 rounded-md text-xs leading-relaxed shadow-sm w-full
                    ${m.role === 'user'
                                        ? 'bg-zinc-100 text-black border border-zinc-200'
                                        : 'bg-white text-zinc-800 border-l-2 border-l-black pl-3'
                                    }
                `}
                            >
                                <div className="whitespace-pre-wrap font-sans">{displayContent}</div>

                                {/* Inline Actions Grid */}
                                {inlineActions.length > 0 && (
                                    <div className="mt-3 grid grid-cols-1 gap-2 pt-3 border-t border-zinc-100">
                                        {inlineActions.map((action, actionIdx) => (
                                            <button
                                                key={actionIdx}
                                                onClick={() => handleActionClick(action)}
                                                className="text-left group flex items-center justify-between p-2 rounded-sm bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 transition-all"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-zinc-800">{action.label}</span>
                                                    {action.type === 'draft_prefill' && <span className="text-[9px] text-zinc-400 uppercase tracking-wider">Add to Draft</span>}
                                                    {action.type === 'suggestion' && <span className="text-[9px] text-zinc-400 uppercase tracking-wider">Suggestion</span>}
                                                </div>
                                                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-white border border-zinc-200 text-zinc-400 group-hover:border-black group-hover:text-black transition-colors">
                                                    <ArrowUp size={10} className="rotate-45" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
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

            {/* Action Deck - Dynamic Contextual Actions - REMOVED PER REQ */}
            {/* <ActionDeck actions={latestActions} onAction={handleActionClick} /> */}

            {/* Input Area (Bottom) */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 relative">
                <div className="flex gap-0 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={dynamicPlaceholder}
                        disabled={isLocked || isSending}
                        className="w-full bg-white border border-zinc-300 p-3 pr-24 text-xs text-black focus:outline-none focus:border-black placeholder-zinc-400 disabled:opacity-50 rounded-sm shadow-inner"
                    />
                    <div className="absolute right-2 top-2 flex gap-2">
                        <button
                            onClick={() => onSend()}
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
