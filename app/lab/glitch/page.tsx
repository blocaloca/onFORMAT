'use client';
import React, { useState, useRef, useEffect } from 'react';
import { 
    Camera, 
    X,
    RotateCcw
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GlitchLab() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bufferCanvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraActive, setCameraActive] = useState(false);

    // Effect Toggles
    const [effects, setEffects] = useState({
        posterize: false,
        solarize: false,
        falseColor: false,
        rgbSplit: false,
        lumaBleed: false
    });

    const toggleEffect = (name: keyof typeof effects) => {
        setEffects(prev => ({ ...prev, [name]: !prev[name] }));
    };

    // Auto-init camera
    useEffect(() => {
        const init = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } 
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = async () => {
                        try {
                            await videoRef.current?.play();
                            setCameraActive(true);
                        } catch (e) {}
                    };
                }
            } catch (e) {}
        };
        init();
        return () => {
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    // Render Loop (Pixel Manipulation Engine)
    useEffect(() => {
        let frameId: number;
        const render = () => {
            if (cameraActive && videoRef.current && canvasRef.current && bufferCanvasRef.current) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                const buffer = bufferCanvasRef.current;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                const bCtx = buffer.getContext('2d', { willReadFrequently: true });

                if (video.videoWidth > 0 && ctx && bCtx) {
                    // Constant processing resolution for 'glitch' feel
                    const procWidth = 320;
                    const procHeight = Math.floor((320 / video.videoWidth) * video.videoHeight);
                    
                    if (buffer.width !== procWidth) {
                        buffer.width = procWidth;
                        buffer.height = procHeight;
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                    }

                    // 1. Capture to Buffer
                    bCtx.drawImage(video, 0, 0, procWidth, procHeight);
                    
                    // 2. PIXEL MANIPULATION (THE WILD STUFF)
                    const imgData = bCtx.getImageData(0, 0, procWidth, procHeight);
                    const data = imgData.data;

                    for (let i = 0; i < data.length; i += 4) {
                        let r = data[i];
                        let g = data[i+1];
                        let b = data[i+2];

                        // A. Posterize (Crunch to 4 levels)
                        if (effects.posterize) {
                            r = Math.floor(r / 64) * 85;
                            g = Math.floor(g / 64) * 85;
                            b = Math.floor(b / 64) * 85;
                        }

                        // B. Solarize (Invert mid-tones)
                        if (effects.solarize) {
                            r = r > 128 ? 255 - r : r;
                            g = g > 128 ? 255 - g : g;
                            b = b > 128 ? 255 - b : b;
                            // Add brutal contrast
                            r = (r - 128) * 4 + 128;
                            g = (g - 128) * 4 + 128;
                            b = (b - 128) * 4 + 128;
                        }

                        // C. False Color (Radioactive Neon)
                        if (effects.falseColor) {
                            const avg = (r + g + b) / 3;
                            if (avg < 85) { r = 255; g = 0; b = 255; } // Magenta
                            else if (avg < 170) { r = 0; g = 255; b = 255; } // Cyan
                            else { r = 255; g = 255; b = 0; } // Yellow
                        }

                        data[i] = r;
                        data[i+1] = g;
                        data[i+2] = b;
                    }

                    // 3. APPLY RGB SPLIT (Physical Channel Offset)
                    if (effects.rgbSplit) {
                        const shift = 8; // Offset pixels
                        const original = new Uint8ClampedArray(data);
                        for (let i = 0; i < data.length; i += 4) {
                            if (i + shift * 4 < data.length) {
                                data[i] = original[i + shift * 4]; // Red channel shift
                            }
                        }
                    }

                    bCtx.putImageData(imgData, 0, 0);

                    // 4. DRAW TO MAIN (UP-SAMPLE)
                    ctx.save();
                    ctx.imageSmoothingEnabled = false;
                    
                    // Luma Bleeding (Smear Pass)
                    if (effects.lumaBleed) {
                        ctx.globalAlpha = 0.5;
                        ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
                        ctx.globalCompositeOperation = 'difference';
                        ctx.drawImage(buffer, 10, 2, canvas.width, canvas.height);
                        ctx.globalCompositeOperation = 'source-over';
                        ctx.globalAlpha = 1.0;
                    } else {
                        ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
                    }
                    
                    ctx.restore();
                }
            }
            frameId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(frameId);
    }, [cameraActive, effects]);

    const handleCapture = () => {
        if (!canvasRef.current || !cameraActive) return;
        const link = document.createElement('a');
        link.download = `BENT_CORE_${Date.now()}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="fixed inset-0 bg-black flex flex-col overflow-hidden select-none touch-none">
            {/* TOP BAR */}
            <div className="h-16 bg-black flex items-center justify-between px-6 z-50">
                <div className="w-10" />
                <div className="text-[8px] font-black text-white/30 tracking-[0.5em] uppercase">
                    Glitch_Lab_Hardware // Direct_Data
                </div>
                <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* VIEWPORT */}
            <div className="flex-1 relative bg-zinc-950 overflow-hidden">
                <video ref={videoRef} autoPlay playsInline muted className="hidden" />
                <canvas ref={bufferCanvasRef} className="hidden" />
                {cameraActive ? (
                    <canvas ref={canvasRef} className="w-full h-full object-contain pixelated" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-10 h-10 border border-white/5 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {/* BOTTOM BAR */}
            <div className="h-28 bg-black flex items-center justify-between px-8 z-50 border-t border-white/5">
                <div className="flex items-center gap-5">
                    {/* Posterize (Cyan) */}
                    <button onClick={() => toggleEffect('posterize')} className={`w-8 h-8 rounded-full transition-all duration-300 ${effects.posterize ? 'bg-cyan-400 scale-125 shadow-[0_0_20px_#22d3ee]' : 'bg-cyan-900/10 border border-cyan-400/20'}`} />
                    {/* Solarize (Orange) */}
                    <button onClick={() => toggleEffect('solarize')} className={`w-8 h-8 rounded-full transition-all duration-300 ${effects.solarize ? 'bg-orange-500 scale-125 shadow-[0_0_20px_#f97316]' : 'bg-orange-900/10 border border-orange-500/20'}`} />
                    {/* False Color (Pink) */}
                    <button onClick={() => toggleEffect('falseColor')} className={`w-8 h-8 rounded-full transition-all duration-300 ${effects.falseColor ? 'bg-pink-500 scale-125 shadow-[0_0_20px_#ec4899]' : 'bg-pink-900/10 border border-pink-500/20'}`} />
                    {/* RGB Split (Lime) */}
                    <button onClick={() => toggleEffect('rgbSplit')} className={`w-8 h-8 rounded-full transition-all duration-300 ${effects.rgbSplit ? 'bg-lime-400 scale-125 shadow-[0_0_20px_#a3e635]' : 'bg-lime-900/10 border border-lime-400/20'}`} />
                    {/* Luma Bleeding (Purple) */}
                    <button onClick={() => toggleEffect('lumaBleed')} className={`w-8 h-8 rounded-full transition-all duration-300 ${effects.lumaBleed ? 'bg-purple-500 scale-125 shadow-[0_0_20px_#a855f7]' : 'bg-purple-900/10 border border-purple-500/20'}`} />
                </div>

                <button onClick={handleCapture} disabled={!cameraActive} className="w-14 h-14 flex items-center justify-center bg-yellow-400 rounded-full text-black shadow-[0_0_30px_rgba(250,204,21,0.2)] active:scale-75 transition-all">
                    <Camera size={24} />
                </button>
            </div>
        </div>
    );
}
