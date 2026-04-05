'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Share2, Camera, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

type EffectKey = 'pixelSort' | 'solarize' | 'falseColor' | 'rgbOffset' | 'lumaBleed';

const sortSpan = (data: Uint8ClampedArray, rowOffset: number, startX: number, endX: number) => {
    const pixels = [];
    for (let x = startX; x < endX; x++) {
        const i = rowOffset + (x * 4);
        pixels.push({
            r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3],
            br: (data[i] + data[i + 1] + data[i + 2]) / 3
        });
    }
    pixels.sort((a, b) => b.br - a.br);
    for (let x = startX; x < endX; x++) {
        const i = rowOffset + (x * 4);
        const p = pixels[x - startX];
        data[i] = p.r; data[i+1] = p.g; data[i+2] = p.b; data[i+3] = p.a;
    }
};

export default function GlitchLab() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bufferCanvasRef = useRef<HTMLCanvasElement>(null);
    
    const [cameraActive, setCameraActive] = useState(false);
    const [intensity, setIntensity] = useState(74);
    const [activeEffects, setActiveEffects] = useState<Record<EffectKey, boolean>>({
        pixelSort: true,
        solarize: false,
        falseColor: false,
        rgbOffset: true,
        lumaBleed: false
    });

    const toggleEffect = (key: EffectKey) => setActiveEffects(prev => ({ ...prev, [key]: !prev[key] }));

    useEffect(() => {
        const init = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } } 
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => videoRef.current?.play().then(() => setCameraActive(true));
                }
            } catch (e) { console.error("Camera failed", e); }
        };
        init();
        return () => {
            if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        };
    }, []);

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
                    const size = 320; // Internal processing resolution
                    if (b.width !== size) { b.width = size; b.height = size; c.width = size; c.height = size; }

                    bCtx.drawImage(v, (v.videoWidth - v.videoHeight) / 2, 0, v.videoHeight, v.videoHeight, 0, 0, size, size);
                    const imgData = bCtx.getImageData(0, 0, size, size);
                    const data = imgData.data;
                    const magnitude = intensity / 100;

                    // PIXEL LOGIC
                    for (let i = 0; i < data.length; i += 4) {
                        let r = data[i]; let g = data[i+1]; let b = data[i+2];

                        // SOLARIZE
                        if (activeEffects.solarize) {
                            r = r > 128 ? 255 - r : r; g = g > 128 ? 255 - g : g; b = b > 128 ? 255 - b : b;
                            r = (r - 128) * (1 + magnitude * 3) + 128; // Brutal magnitude contrast
                            g = (g - 128) * (1 + magnitude * 3) + 128;
                            b = (b - 128) * (1 + magnitude * 3) + 128;
                        }

                        // FALSE COLOR
                        if (activeEffects.falseColor) {
                            const avgIdx = (r + g + b) / 3;
                            if (avgIdx < (85 * magnitude)) { r = 255; g = 0; b = 255; }
                            else if (avgIdx < (170 * magnitude)) { r = 0; g = 255; b = 255; }
                            else { r = 255; g = 255; b = 0; }
                        }

                        data[i] = r; data[i+1] = g; data[i+2] = b;
                    }

                    // RGB OFFSET
                    if (activeEffects.rgbOffset) {
                        const shift = Math.floor(25 * magnitude);
                        const original = new Uint8ClampedArray(data);
                        for (let i = 0; i < data.length; i += 4) {
                            if (i + shift * 4 < data.length) data[i] = original[i + shift * 4];
                        }
                    }

                    // PIXEL SORT
                    if (activeEffects.pixelSort) {
                        const threshold = 255 - (intensity * 2.5);
                        for (let row = 0; row < size; row += 2) {
                            const rowStart = row * size * 4;
                            let sorting = false; let spanStart = 0;
                            for (let col = 0; col < size; col++) {
                                const idx = rowStart + (col * 4);
                                const brightness = (data[idx] + data[idx+1] + data[idx+2]) / 3;
                                if (brightness > threshold && !sorting) { sorting = true; spanStart = col; }
                                else if (brightness <= threshold && sorting) { sorting = false; sortSpan(data, rowStart, spanStart, col); }
                            }
                        }
                    }

                    bCtx.putImageData(imgData, 0, 0);
                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(b, 0, 0);

                    // LUMA BLEED (Second Pass)
                    if (activeEffects.lumaBleed) {
                        ctx.globalAlpha = 0.5 * magnitude;
                        ctx.globalCompositeOperation = 'difference';
                        ctx.drawImage(b, 5, 2);
                        ctx.globalCompositeOperation = 'source-over';
                        ctx.globalAlpha = 1.0;
                    }
                }
            }
            frameId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(frameId);
    }, [cameraActive, intensity, activeEffects]);

    const handleShare = async () => {
        if (!canvasRef.current || !bufferCanvasRef.current) return;
        
        // High-Resolution Capture Bridge (Upscale 320 -> 1080)
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = 1080;
        outputCanvas.height = 1080;
        const oCtx = outputCanvas.getContext('2d');
        
        if (oCtx) {
            oCtx.imageSmoothingEnabled = false; // Preserve the crunchy glitches
            oCtx.drawImage(canvasRef.current, 0, 0, 1080, 1080);
        }

        outputCanvas.toBlob(async (blob) => {
            if (!blob) return;
            const file = new File([blob], `bent_${Date.now()}.png`, { type: 'image/png' });
            if (navigator.share) await navigator.share({ files: [file], title: 'onFORMAT Glitch' }).catch(e => {});
            else { 
                const link = document.createElement('a'); 
                link.download = `bent_${Date.now()}.png`; 
                link.href = URL.createObjectURL(blob); 
                link.click(); 
            }
        });
    };

    const effectButtons = [
        { id: 'pixelSort', label: 'PIXEL_SORT', activeBg: 'bg-zinc-800 text-white border-white/40' },
        { id: 'solarize', label: 'SOLARIZE', activeBg: 'bg-orange-500 text-white border-orange-500' },
        { id: 'falseColor', label: 'FALSE_COLOR', activeBg: 'bg-magenta-500 text-white border-magenta-500' },
        { id: 'rgbOffset', label: 'RGB_OFFSET', activeBg: 'bg-cyan-400 text-black border-cyan-400' },
        { id: 'lumaBleed', label: 'LUMA_BLEED', activeBg: 'bg-purple-600 text-white border-purple-600' }
    ] as const;

    return (
        <div className="fixed inset-0 bg-black flex flex-col font-sans select-none overflow-hidden touch-none">
            {/* HEADER - COMPRESSED */}
            <div className="h-12 flex items-center justify-between px-6 z-50 pt-2">
                <h1 className="text-lg font-black italic tracking-tighter text-white">ON_GLITCH</h1>
                <button onClick={handleShare} className="p-1 text-cyan-400 active:scale-90 transition-transform">
                    <Share2 size={20} />
                </button>
            </div>

            {/* VIEWPORT - COMPRESSED */}
            <div className="relative flex-1 flex flex-col items-center justify-center p-2">
                <div className="relative w-full aspect-square max-w-[420px] bg-zinc-900 border-2 border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <video ref={videoRef} className="hidden" playsInline muted />
                    <canvas ref={bufferCanvasRef} className="hidden" />
                    <canvas ref={canvasRef} className="w-full h-full object-cover pixelated" />
                </div>
            </div>

            {/* CONTROLS - COMPRESSED TRAY */}
            <div className="bg-black p-4 space-y-4 pb-8">
                {/* EFFECT BUTTONS */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {effectButtons.map((eff) => (
                        <button
                            key={eff.id} onClick={() => toggleEffect(eff.id)}
                            className={`flex-1 min-w-[90px] py-3 text-[8px] font-black tracking-widest border transition-all ${
                                activeEffects[eff.id] ? eff.activeBg : `bg-zinc-900/50 text-zinc-500 border-zinc-800`
                            }`}
                            style={activeEffects[eff.id] && eff.id === 'falseColor' ? { backgroundColor: '#FF00FF', borderColor: '#FF00FF' } : {}}
                        >
                            {eff.label}
                        </button>
                    ))}
                </div>

                {/* INTENSITY SLIDER - TIGHTER */}
                <div className="space-y-1">
                    <div className="flex justify-between items-end">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Intensity</label>
                        <span className="text-2xl font-black text-cyan-400 leading-none">{intensity}%</span>
                    </div>
                    <div className="relative h-4 flex items-center">
                        <div className="absolute inset-x-0 h-[1px] bg-zinc-800" />
                        <div className="absolute left-0 h-[1px] bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: `${intensity}%` }} />
                        <input 
                            type="range" min="0" max="100" value={intensity}
                            onChange={(e) => setIntensity(parseInt(e.target.value))}
                            className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="absolute w-1 h-6 bg-cyan-400 shadow-[0_0_15px_#22d3ee] pointer-events-none" style={{ left: `calc(${intensity}% - 2px)` }} />
                    </div>
                </div>

                {/* CAPTURE SECTION - COMPRESSED */}
                <div className="flex items-center justify-between pt-2 max-w-sm mx-auto w-full px-4">
                    <button 
                        onClick={() => router.back()}
                        className="px-4 py-3 bg-magenta-500 text-white text-[9px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                        style={{ backgroundColor: '#FF00FF' }}
                    >
                        Work!
                    </button>
                    <div className="flex flex-col items-center gap-2">
                        <button onClick={handleShare} className="w-16 h-16 border-[3px] border-yellow-400 p-1 active:scale-90 transition-transform">
                            <div className="w-full h-full bg-yellow-400 flex items-center justify-center text-black"><Camera size={24} /></div>
                        </button>
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-yellow-400">Capture</span>
                    </div>
                    <div className="w-10 h-1" />
                </div>
            </div>
            <style jsx global>{` .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } .pixelated { image-rendering: pixelated; } `}</style>
        </div>
    );
}
