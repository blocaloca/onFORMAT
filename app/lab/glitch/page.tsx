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
                        await videoRef.current?.play();
                        setCameraActive(true);
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

                    // Buffer for pixel manipulation
                    buffer.width = canvas.width;
                    buffer.height = canvas.height;
                    bCtx.drawImage(video, 0, 0, buffer.width, buffer.height);

                    ctx.save();
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // --- COMPUTE FILTERS ---
                    let filterStr = "";
                    
                    if (effects.posterize) {
                        // Simulating posterization via high contrast and brightness crushing
                        filterStr += "contrast(300%) brightness(120%) ";
                    }
                    if (effects.solarize) {
                        filterStr += "invert(100%) contrast(150%) ";
                    }
                    if (effects.falseColor) {
                        filterStr += "hue-rotate(270deg) saturate(500%) contrast(200%) ";
                    }
                    
                    ctx.filter = filterStr.trim() || 'none';

                    // --- DRAW PASSES ---
                    if (effects.rgbSplit) {
                        // Cyan Shift
                        ctx.globalAlpha = 0.6;
                        ctx.drawImage(buffer, -15, 0, canvas.width, canvas.height);
                        ctx.globalCompositeOperation = 'screen';
                        // Red Shift
                        ctx.filter = (filterStr + " hue-rotate(180deg) saturate(300%)").trim();
                        ctx.drawImage(buffer, 15, 0, canvas.width, canvas.height);
                        ctx.globalCompositeOperation = 'source-over';
                        ctx.globalAlpha = 1.0;
                    } else {
                        ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
                    }

                    // --- POST-DRAWS (BLEEDING) ---
                    if (effects.lumaBleed) {
                        ctx.globalAlpha = 0.3;
                        ctx.globalCompositeOperation = 'lighten';
                        // Offset horizontal smear
                        ctx.drawImage(canvas, 10, 0, canvas.width, canvas.height);
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
        link.download = `GLITCH_SHOT_${Date.now()}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="fixed inset-0 bg-black flex flex-col overflow-hidden select-none touch-none">
            {/* TOP BAR */}
            <div className="h-16 bg-black flex items-center justify-between px-6 z-50">
                <div className="w-10" /> {/* Spacer */}
                <div className="text-[10px] font-bold text-white/20 tracking-widest uppercase">
                    {cameraActive ? 'LINK_ACTIVE' : 'INITIALIZING'}
                </div>
                <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* VIEWPORT */}
            <div className="flex-1 relative bg-zinc-950 overflow-hidden">
                <video ref={videoRef} autoPlay playsInline muted className="hidden" />
                <canvas ref={bufferCanvasRef} className="hidden" />
                {cameraActive ? (
                    <canvas ref={canvasRef} className="w-full h-full object-contain" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <RotateCcw className="text-white/10 animate-spin" size={32} />
                    </div>
                )}
            </div>

            {/* BOTTOM BAR */}
            <div className="h-28 bg-black flex items-center justify-between px-8 z-50">
                <div className="flex items-center gap-4">
                    {/* Posterize */}
                    <button 
                        onClick={() => toggleEffect('posterize')}
                        className={`w-8 h-8 rounded-full transition-all ${effects.posterize ? 'bg-cyan-400 scale-110 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-cyan-900/30 border border-cyan-400/20'}`}
                    />
                    {/* Solarize */}
                    <button 
                        onClick={() => toggleEffect('solarize')}
                        className={`w-8 h-8 rounded-full transition-all ${effects.solarize ? 'bg-orange-400 scale-110 shadow-[0_0_15px_rgba(251,146,60,0.5)]' : 'bg-orange-900/30 border border-orange-400/20'}`}
                    />
                    {/* False Color */}
                    <button 
                        onClick={() => toggleEffect('falseColor')}
                        className={`w-8 h-8 rounded-full transition-all ${effects.falseColor ? 'bg-pink-500 scale-110 shadow-[0_0_15px_rgba(236,72,153,0.5)]' : 'bg-pink-900/30 border border-pink-500/20'}`}
                    />
                    {/* RGB Split */}
                    <button 
                        onClick={() => toggleEffect('rgbSplit')}
                        className={`w-8 h-8 rounded-full transition-all ${effects.rgbSplit ? 'bg-lime-400 scale-110 shadow-[0_0_15px_rgba(163,230,53,0.5)]' : 'bg-lime-900/30 border border-lime-400/20'}`}
                    />
                    {/* Luma Bleeding */}
                    <button 
                        onClick={() => toggleEffect('lumaBleed')}
                        className={`w-8 h-8 rounded-full transition-all ${effects.lumaBleed ? 'bg-purple-500 scale-110 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-purple-900/30 border border-purple-500/20'}`}
                    />
                </div>

                <button 
                    onClick={handleCapture}
                    disabled={!cameraActive}
                    className="w-16 h-16 flex items-center justify-center bg-yellow-400 rounded-full text-black shadow-[0_0_20px_rgba(250,204,21,0.3)] active:scale-90 transition-all disabled:opacity-20"
                >
                    <Camera size={28} />
                </button>
            </div>
        </div>
    );
}
