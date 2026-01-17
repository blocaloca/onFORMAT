import React, { useState } from 'react';
import { ImageExportButton } from '@/components/export/ImageExportButton';
import { RectangleVertical, RectangleHorizontal, Smartphone, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface DocumentNavBarProps {
    versions: any[];
    activeVersionIndex: number;
    onSelectVersion: (index: number) => void;
    onNew: () => void;
    onDuplicate: () => void;
    onClear: () => void;
    onSave: () => void;
    title: string;
    orientation?: 'portrait' | 'landscape';
    onToggleOrientation?: (o: 'portrait' | 'landscape') => void;
    onExportPdf?: (scope: 'current' | 'all') => void;
    isExportingPdf?: boolean;
    projectId?: string;
}

export const DocumentNavBar = ({
    versions,
    activeVersionIndex,
    onSelectVersion,
    onNew,
    onDuplicate,
    onClear,
    onSave,
    title,
    orientation = 'portrait',
    onToggleOrientation,
    onExportPdf,
    isExportingPdf,
    projectId
}: DocumentNavBarProps) => {
    const [showVersionMenu, setShowVersionMenu] = useState(false);
    const [showQR, setShowQR] = useState(false);

    return (
        <div className="w-full h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 select-none">
            {/* Left: Version / Document Controls */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <button
                        onClick={() => setShowVersionMenu(!showVersionMenu)}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-zinc-400 hover:text-white transition-colors"
                    >
                        <span>{title} v.{versions.length - activeVersionIndex}</span>
                        <span className="text-[8px] transform scale-y-75">▼</span>
                    </button>

                    {showVersionMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowVersionMenu(false)}
                            />
                            <div className="absolute top-full left-0 mt-2 w-48 bg-zinc-900 border border-zinc-700 shadow-xl rounded-sm py-1 z-20 flex flex-col">
                                <div className="px-3 py-2 text-[10px] uppercase font-bold text-zinc-500 border-b border-zinc-800 mb-1">
                                    Version History
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {versions.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                onSelectVersion(i);
                                                setShowVersionMenu(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 text-xs hover:bg-zinc-800 transition-colors ${i === activeVersionIndex ? 'bg-zinc-800 text-emerald-400 font-bold' : 'text-zinc-400'
                                                }`}
                                        >
                                            Version {versions.length - i}
                                            {i === 0 && <span className="ml-2 text-[9px] text-zinc-400 font-normal">(Current)</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="h-4 w-px bg-zinc-800 mx-2" />

                <button onClick={onNew} className="text-[10px] font-bold uppercase text-zinc-400 hover:text-white transition-colors">
                    New
                </button>
                <button onClick={onDuplicate} className="text-[10px] font-bold uppercase text-zinc-400 hover:text-white transition-colors">
                    Duplicate
                </button>
                <button onClick={onClear} className="text-[10px] font-bold uppercase text-zinc-400 hover:text-red-500 transition-colors">
                    Clear
                </button>




            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">



                <button
                    onClick={() => setShowQR(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold uppercase tracking-wide text-white rounded-sm transition-all border border-zinc-700 hover:border-zinc-600"
                >
                    <Smartphone size={12} />
                    <span>Cast & Crew</span>
                </button>

                {onToggleOrientation && (
                    <div className="flex bg-zinc-800 rounded-sm p-0.5 gap-0.5 print-hidden">
                        <button
                            onClick={() => onToggleOrientation('portrait')}
                            className={`p-1 rounded-sm transition-all ${orientation === 'portrait' ? 'bg-zinc-600 shadow-sm text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                            title="Portrait (8.5 x 11)"
                        >
                            <RectangleVertical size={14} />
                        </button>
                        <button
                            onClick={() => onToggleOrientation('landscape')}
                            className={`p-1 rounded-sm transition-all ${orientation === 'landscape' ? 'bg-zinc-600 shadow-sm text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                            title="Landscape (11 x 8.5)"
                        >
                            <RectangleHorizontal size={14} />
                        </button>
                    </div>
                )}

                <ImageExportButton
                    title={title}
                    onNewVersion={onNew}
                    nextVersionLabel={`V${versions.length + 1}`}
                    onExportPdf={onExportPdf}
                    isExportingPdf={isExportingPdf}
                />

                {/* QR Modal */}
                {showQR && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowQR(false)}>
                        <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setShowQR(false)}
                                className="absolute top-2 right-2 p-2 hover:bg-zinc-100 rounded-full transition-colors"
                            >
                                <X size={16} className="text-zinc-400" />
                            </button>

                            <div className="text-center space-y-4">
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-tight text-zinc-900">Project Access</h3>
                                    <p className="text-xs text-zinc-500 font-medium">Scan to join mobile dashboard</p>
                                </div>

                                <div className="flex justify-center p-4 bg-white border-2 border-zinc-900 rounded-lg shadow-sm">
                                    <QRCodeSVG
                                        value={`${window.location.protocol}//${window.location.host}/join/${projectId}`}
                                        size={200}
                                        level="H"
                                    />
                                </div>

                                <div className="bg-zinc-50 p-3 rounded text-left border border-zinc-100">
                                    <p className="text-[10px] font-bold uppercase text-zinc-400 mb-1">Invite Link</p>
                                    <div className="flex items-center gap-2">
                                        <code className="text-[10px] font-mono text-zinc-600 truncate flex-1 block p-1 bg-white border border-zinc-200 rounded">
                                            {`${window.location.protocol}//${window.location.host}/join/${projectId}`}
                                        </code>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(`${window.location.protocol}//${window.location.host}/join/${projectId}`)}
                                            className="text-[10px] uppercase font-bold text-emerald-600 hover:underline"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};
