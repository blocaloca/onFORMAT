'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Share2, Camera, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

type EffectKey = 'pixelSort' | 'rgbOffset' | 'datamosh' | 'scanline' | 'noise';

export default function GlitchLab() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bufferCanvasRef = useRef<HTMLCanvasElement>(null);
    
    const [cameraActive, setCameraActive] = useState(false);
    const [intensity, setIntensity] = useState(74);
    const [activeEffects, setActiveEffects] = useState<Record<EffectKey, boolean>>({
        pixelSort: false,
        rgbOffset: true,
        datamosh: false,
        scanline: false,
        noise: false
    });

    const toggleEffect = (key: EffectKey) => {
        setActiveEffects(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Camera Init
    useEffect(() => {
        const init = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment', width: { ideal: 720 }, height: { ideal: 720 } } 
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play().then(() => setCameraActive(true));
                    };
                }
            } catch (e) {
                console.error("Camera failed", e);
            }
        };
        init();
        return () => {
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    // Main Render Loop
    useEffect(() => {
        let frameId: number;
        const render = () => {
            if (cameraActive && videoRef.current && canvasRef.current && bufferCanvasRef.current) {
                const v = videoRef.current;
                const c = canvasRef.current;
                const b = bufferCanvasRef.current;
                const ctx = c.getContext('2d', { willReadFrequently: true });
                const bCtx = b.getContext('2d', { willReadFrequently: true });

                if (v.videoWidth > 0 && ctx && bCtx) {
                    const size = Math.min(v.videoWidth, v.videoHeight);
                    if (c.width !== size) {
                        c.width = size;
                        c.height = size;
                        b.width = size;
                        b.height = size;
                    }

                    // 1. Draw raw to buffer
                    bCtx.drawImage(v, (v.videoWidth - size) / 2, (v.videoHeight - size) / 2, size, size, 0, 0, size, size);
                    
                    // 2. Pixel Logic
                    const imgData = bCtx.getImageData(0, 0, size, size);
                    const data = imgData.data;
                    const magnitude = intensity / 100;

                    // RGB OFFSET
                    if (activeEffects.rgbOffset) {
                        const shift = Math.floor(20 * magnitude);
                        const original = new Uint8ClampedArray(data);
                        for (let i = 0; i < data.length; i += 4) {
                            if (i + shift * 4 < data.length) {
                                data[i] = original[i + shift * 4]; // Red shift
                            }
                        }
                    }

                    // NOISE / GRAIN
                    if (activeEffects.noise) {
                        for (let i = 0; i < data.length; i += 4) {
                            const n = (Math.random() - 0.5) * 100 * magnitude;
                            data[i] += n;
                            data[i+1] += n;
                            data[i+2] += n;
                        }
                    }

                    // DATAMOSH (Row Jitter)
                    if (activeEffects.datamosh && Math.random() < (0.2 * magnitude)) {
                        const row = Math.floor(Math.random() * size);
                        const rowShift = Math.floor((Math.random() - 0.5) * 50 * magnitude);
                        const rowStart = row * size * 4;
                        const rowEnd = (row + 10) * size * 4;
                        for (let i = rowStart; i < rowEnd && i < data.length; i++) {
                            data[i] = data[i + rowShift * 4] || data[i];
                        }
                    }

                    // PIXEL SORT (Shredding by Luminosity)
                    if (activeEffects.pixelSort) {
                        const threshold = 255 - (intensity * 2.5);
                        for (let row = 0; row < size; row++) {
                            const rowStart = row * size * 4;
                            const rowPixels: { r: number, g: number, b: number, a: number, br: number }[] = [];
                            
                            // Find sortable spans
                            let sorting = false;
                            let spanStart = 0;
                            
                            for (let col = 0; col < size; col++) {
                                const idx = rowStart + (col * 4);
                                const brightness = (data[idx] + data[idx+1] + data[idx+2]) / 3;
                                
                                if (brightness > threshold && !sorting) {
                                    sorting = true;
                                    spanStart = col;
                                } else if (brightness <= threshold && sorting) {
                                    sorting = false;
                                    // Sort the span [spanStart, col]
                                    this.sortSpan(data, rowStart, spanStart, col);
                                }
                            }
                        }
                    }

                    bCtx.putImageData(imgData, 0, 0);

                    // 3. Draw to final with Scanlines
                    ctx.clearRect(0, 0, size, size);
                    ctx.drawImage(b, 0, 0);

                    if (activeEffects.scanline) {
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                        for (let i = 0; i < size; i += 4) {
                            ctx.fillRect(0, i, size, 2);
                        }
                    }
                }
            }
            frameId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(frameId);
    }, [cameraActive, intensity, activeEffects]);

    const handleShare = async () => {
        if (!canvasRef.current) return;
        canvasRef.current.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File([blob], `glitch_${Date.now()}.png`, { type: 'image/png' });
            
            if (navigator.share) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'onFORMAT Glitch',
                        text: 'Captured via on_glitch'
                    });
                } catch (err) {
                    console.error("Share failed", err);
                }
            } else {
                // Fallback to download
                const link = document.createElement('a');
                link.download = `glitch_${Date.now()}.png`;
                link.href = URL.createObjectURL(blob);
                link.click();
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black flex flex-col font-sans select-none overflow-hidden touch-none">
            {/* HEADER */}
            <div className="h-16 flex items-center justify-between px-6 z-50">
                <h1 className="text-xl font-black italic tracking-tighter text-white">ON_GLITCH</h1>
                <button 
                    onClick={handleShare}
                    className="p-2 text-cyan-400 active:scale-90 transition-transform"
                >
                    <Share2 size={24} />
                </button>
            </div>

            {/* VIEWPORT */}
            <div className="relative flex-1 flex flex-col items-center justify-center p-4">
                <div className="relative w-full aspect-square max-w-[500px] border-2 border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    {/* Viewport Accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-magenta-500 z-10" style={{ borderColor: '#FF00FF' }} />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 z-10" />
                    
                    <video ref={videoRef} className="hidden" playsInline muted />
                    <canvas ref={bufferCanvasRef} className="hidden" />
                    <canvas ref={canvasRef} className="w-full h-full object-cover grayscale" style={{ filter: 'brightness(1.2) contrast(1.5)' }} />
                </div>
            </div>

            {/* CONTROLS */}
            <div className="bg-black p-6 space-y-8 pb-12">
                
                {/* EFFECT BUTTONS */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {([
                        { id: 'pixelSort', label: 'PIXEL_SORT', color: 'text-purple-400' },
                        { id: 'rgbOffset', label: 'RGB_OFFSET', color: 'text-cyan-400', activeBg: 'bg-cyan-400 text-black' },
                        { id: 'datamosh', label: 'DATAMOSH', color: 'text-white', activeBg: 'bg-magenta-500 text-white' },
                        { id: 'scanline', label: 'SCANLINE', color: 'text-cyan-600' },
                        { id: 'noise', label: 'NOISE', color: 'text-yellow-200' }
                    ] as const).map((eff) => (
                        <button
                            key={eff.id}
                            onClick={() => toggleEffect(eff.id)}
                            className={`flex-1 min-w-[90px] py-4 text-[9px] font-black tracking-widest border transition-all ${
                                activeEffects[eff.id] 
                                ? (eff.activeBg || 'bg-zinc-800 text-white border-white/40') 
                                : `bg-zinc-900/50 text-zinc-500 border-zinc-800`
                            }`}
                            style={activeEffects[eff.id] && eff.id === 'datamosh' ? { backgroundColor: '#FF00FF' } : {}}
                        >
                            {eff.label}
                        </button>
                    ))}
                </div>

                {/* INTENSITY SLIDER */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Intensity</label>
                        <span className="text-3xl font-black text-cyan-400 leading-none">{intensity}%</span>
                    </div>
                    <div className="relative h-6 flex items-center">
                        <div className="absolute inset-x-0 h-[2px] bg-zinc-800" />
                        <div className="absolute left-0 h-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: `${intensity}%` }} />
                        <input 
                            type="range"
                            min="0"
                            max="100"
                            value={intensity}
                            onChange={(e) => setIntensity(parseInt(e.target.value))}
                            className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                        />
                        {/* Thumb indicator overlay */}
                        <div 
                            className="absolute w-1 h-8 bg-cyan-400 shadow-[0_0_15px_#22d3ee] pointer-events-none"
                            style={{ left: `calc(${intensity}% - 2px)` }}
                        />
                    </div>
                </div>

                {/* CAPTURE SECTION */}
                <div className="flex items-center justify-center gap-12 pt-4">
                    <button 
                        onClick={() => router.back()}
                        className="px-6 py-4 bg-magenta-500 text-white text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                        style={{ backgroundColor: '#FF00FF' }}
                    >
                        Work!
                    </button>

                    <div className="flex flex-col items-center gap-4">
                        <button 
                            onClick={handleShare}
                            className="w-20 h-20 border-4 border-yellow-400 p-1 active:scale-90 transition-transform"
                        >
                            <div className="w-full h-full bg-yellow-400 flex items-center justify-center text-black">
                                <Camera size={32} />
                            </div>
                        </button>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400">Capture</span>
                    </div>

                    <div className="w-16" /> {/* Spacer for symmetry */}
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
