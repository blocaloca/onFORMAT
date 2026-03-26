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
                    video: { facingMode: 'environment', width: { ideal: 1080 }, height: { ideal: 1920 } } 
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = async () => {
                        try {
                            await videoRef.current?.play();
                            setCameraActive(true);
                        } catch (e) {
                            console.error("Autoplay blocked", e);
                        }
                    };
                }
            } catch (e) {
                console.error("Camera access failed", e);
            }
        };
        init();
        return () => {
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    // Render Loop
    useEffect(() => {
        let frameId: number;
        const render = () => {
            if (cameraActive && videoRef.current && canvasRef.current && bufferCanvasRef.current) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                const buffer = bufferCanvasRef.current;
                const ctx = canvas.getContext('2d', { alpha: false });
                const bCtx = buffer.getContext('2d', { alpha: false });

                if (video.videoWidth > 0 && ctx && bCtx) {
                    if (canvas.width !== video.videoWidth) {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                    }

                    // 1. RAW BUFFER
                    buffer.width = canvas.width;
                    buffer.height = canvas.height;
                    
                    // PIXELATION (If posterize is on, we shrink the buffer even more)
                    const pScale = effects.posterize ? 0.2 : 1.0;
                    const tempW = Math.max(1, buffer.width * pScale);
                    const tempH = Math.max(1, buffer.height * pScale);
                    
                    bCtx.imageSmoothingEnabled = false;
                    bCtx.drawImage(video, 0, 0, tempW, tempH);
                    bCtx.drawImage(buffer, 0, 0, tempW, tempH, 0, 0, buffer.width, buffer.height);

                    // 2. MAIN COMPOSITE
                    ctx.save();
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // --- COMPUTE AGGRESSIVE FILTERS ---
                    let filters: string[] = [];
                    
                    if (effects.posterize) {
                        filters.push("contrast(1000%) saturate(200%) brightness(120%)");
                    }
                    if (effects.solarize) {
                        filters.push("invert(100%) contrast(200%) brightness(150%)");
                    }
                    if (effects.falseColor) {
                        filters.push("sepia(100%) hue-rotate(270deg) saturate(1000%) contrast(150%)");
                    }
                    
                    ctx.filter = filters.length > 0 ? filters.join(' ') : 'none';

                    // --- MULTI-PASS DRAW ---
                    if (effects.rgbSplit) {
                        // Cyan Channel Shift
                        ctx.globalAlpha = 0.5;
                        ctx.drawImage(buffer, -20, 0, canvas.width, canvas.height);
                        ctx.globalCompositeOperation = 'screen';
                        // Red Channel Shift
                        ctx.filter = (filters.join(' ') + " hue-rotate(180deg) saturate(400%)").trim();
                        ctx.drawImage(buffer, 20, 0, canvas.width, canvas.height);
                        ctx.globalCompositeOperation = 'source-over';
                        ctx.globalAlpha = 1.0;
                    } else {
                        ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
                    }

                    // --- LUMA BLEEDING (The Smear) ---
                    if (effects.lumaBleed) {
                        ctx.globalAlpha = 0.4;
                        ctx.globalCompositeOperation = 'lighten';
                        // Multiple offsets for trailing effect
                        ctx.drawImage(canvas, 10, 0, canvas.width, canvas.height);
                        ctx.drawImage(canvas, 20, 0, canvas.width, canvas.height);
                        ctx.globalCompositeOperation = 'source-over';
                        ctx.globalAlpha = 1.0;
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
        link.download = `STILL_BENT_${Date.now()}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="fixed inset-0 bg-black flex flex-col overflow-hidden select-none touch-none">
            {/* TOP BAR */}
            <div className="h-16 bg-black flex items-center justify-between px-6 z-50">
                <div className="w-10" /> {/* Spacer */}
                <div className="text-[9px] font-black text-white/50 tracking-[0.4em] uppercase">
                    Glitch_Cam_Core // v0.1b
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
                        <div className="w-12 h-12 border-2 border-white/5 border-t-white/40 rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {/* BOTTOM BAR */}
            <div className="h-28 bg-black flex items-center justify-between px-8 z-50 border-t border-white/5">
                <div className="flex items-center gap-5">
                    {/* Posterize (Cyan) */}
                    <button 
                        onClick={() => toggleEffect('posterize')}
                        className={`w-7 h-7 rounded-full transition-all duration-300 ${effects.posterize ? 'bg-cyan-400 scale-125 shadow-[0_0_20px_#22d3ee]' : 'bg-cyan-900/20 border border-cyan-400/20'}`}
                    />
                    {/* Solarize (Orange) */}
                    <button 
                        onClick={() => toggleEffect('solarize')}
                        className={`w-7 h-7 rounded-full transition-all duration-300 ${effects.solarize ? 'bg-orange-400 scale-125 shadow-[0_0_20px_#fb923c]' : 'bg-orange-900/20 border border-orange-400/20'}`}
                    />
                    {/* False Color (Pink) */}
                    <button 
                        onClick={() => toggleEffect('falseColor')}
                        className={`w-7 h-7 rounded-full transition-all duration-300 ${effects.falseColor ? 'bg-pink-500 scale-125 shadow-[0_0_20px_#ec4899]' : 'bg-pink-900/20 border border-pink-500/20'}`}
                    />
                    {/* RGB Split (Lime) */}
                    <button 
                        onClick={() => toggleEffect('rgbSplit')}
                        className={`w-7 h-7 rounded-full transition-all duration-300 ${effects.rgbSplit ? 'bg-lime-400 scale-125 shadow-[0_0_20px_#a3e635]' : 'bg-lime-900/20 border border-lime-400/20'}`}
                    />
                    {/* Luma Bleeding (Purple) */}
                    <button 
                        onClick={() => toggleEffect('lumaBleed')}
                        className={`w-7 h-7 rounded-full transition-all duration-300 ${effects.lumaBleed ? 'bg-purple-500 scale-125 shadow-[0_0_20px_#a855f7]' : 'bg-purple-900/20 border border-purple-500/20'}`}
                    />
                </div>

                <button 
                    onClick={handleCapture}
                    disabled={!cameraActive}
                    className="w-14 h-14 flex items-center justify-center bg-yellow-400 rounded-full text-black shadow-[0_0_30px_rgba(250,204,21,0.2)] active:scale-75 transition-all disabled:opacity-20"
                >
                    <Camera size={24} />
                </button>
            </div>
        </div>
    );
}
