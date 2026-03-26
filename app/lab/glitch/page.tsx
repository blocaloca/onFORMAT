'use client';
import React, { useState, useRef, useEffect } from 'react';
import { 
    Zap, 
    Monitor, 
    Camera, 
    FileWarning, 
    Activity,
    ShieldAlert,
    Scan,
    Settings,
    X,
    Maximize2,
    RotateCcw,
    Power,
    Command
} from 'lucide-react';

// STYLING COMPONENT
const GlitchStyles = () => (
    <style jsx global>{`
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        @keyframes flicker { 0% { opacity: 0.9; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
        @keyframes noise { 0% { transform: translate(0,0); } 10% { transform: translate(-2px, -2px); } 20% { transform: translate(2px, 2px); } 100% { transform: translate(0,0); } }
        .crt-overlay {
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.05), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.05));
            background-size: 100% 2px, 3px 100%;
            pointer-events: none;
        }
        .jitter { animation: noise 0.1s infinite; }
        .pixelated { image-rendering: pixelated; }
        .glass-panel { background: rgba(0, 0, 0, 0.3); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.05); }
        .text-glow { text-shadow: 0 0 10px rgba(16, 185, 129, 0.5); }
    `}</style>
);

export default function GlitchLab() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bufferCanvasRef = useRef<HTMLCanvasElement>(null);
    
    // States
    const [intensity, setIntensity] = useState(50);
    const [degradation, setDegradation] = useState(10);
    const [cameraActive, setCameraActive] = useState(false);
    const [vhsMode, setVhsMode] = useState(false);
    const [bentMode, setBentMode] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [status, setStatus] = useState('STANDBY');

    // Auto-Start Camera
    useEffect(() => {
        startCamera();
        return () => {
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
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

                if (video.videoWidth > 0 && video.readyState >= 2 && ctx && bCtx) {
                    if (canvas.width !== video.videoWidth) {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                    }

                    // 1. DOWNSAMPLE (PIXELATION)
                    // We shrink it significantly more at high degradation
                    const pScale = degradation > 20 ? (0.3 / (1 + (degradation / 5))) : 1;
                    buffer.width = Math.max(1, canvas.width * pScale);
                    buffer.height = Math.max(1, canvas.height * pScale);
                    
                    bCtx.imageSmoothingEnabled = false;
                    bCtx.drawImage(video, 0, 0, buffer.width, buffer.height);

                    // 2. MAIN CANVAS RENDER
                    ctx.save();
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // A. Global Warp (Bent Circuit)
                    if (bentMode || degradation > 60) {
                        const skew = (degradation - 40) * 0.5 * (Math.PI / 180);
                        ctx.setTransform(1.1, Math.sin(skew), Math.tan(skew), 1.1, 0, 0);
                    }

                    // B. Filters (AGGRESSIVE COLOR THRUST)
                    // Match the 'example' images: inverted colors, solarization, neon hues
                    const hue = intensity * 3.6;
                    const contrast = 100 + (intensity * 4);
                    const saturate = 100 + (intensity * 5);
                    const invert = bentMode ? `invert(100%)` : '';
                    const brightness = 100 + (intensity * 0.5);
                    
                    // The 'VHS' tracking lines jitter
                    const vhsJitter = vhsMode ? (Math.random() - 0.5) * (degradation / 5) : 0;
                    
                    ctx.filter = `${invert} contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hue}deg) brightness(${brightness}%)`;
                    
                    // C. DRAW (RGB SPLIT)
                    ctx.imageSmoothingEnabled = false;
                    
                    if (intensity > 70 || bentMode) {
                        // Dramatic Red Shift
                        ctx.globalAlpha = 0.5;
                        ctx.drawImage(buffer, -10 + vhsJitter, 0, canvas.width, canvas.height);
                        ctx.globalCompositeOperation = 'screen';
                        // Dramatic Cyan Shift
                        ctx.filter = `hue-rotate(${hue + 180}deg) saturate(300%)`;
                        ctx.drawImage(buffer, 10 + vhsJitter, 0, canvas.width, canvas.height);
                        ctx.globalCompositeOperation = 'source-over';
                    } else {
                        ctx.drawImage(buffer, vhsJitter, 0, canvas.width, canvas.height);
                    }

                    // D. VHS TRACKING LINE (Random white bar)
                    if (vhsMode && Math.random() > 0.95) {
                        ctx.fillStyle = 'white';
                        ctx.globalAlpha = 0.3;
                        ctx.fillRect(0, Math.random() * canvas.height, canvas.width, 2);
                    }

                    ctx.restore();
                }
            }
            frameId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(frameId);
    }, [cameraActive, intensity, degradation, vhsMode, bentMode]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment', width: { ideal: 1080 }, height: { ideal: 1080 } } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = async () => {
                    try {
                        await videoRef.current?.play();
                        setCameraActive(true);
                        setStatus('UPLINK_LIVE');
                    } catch (e) {
                        setStatus('CLICK_ACTIVATE');
                    }
                };
            }
        } catch (e) {
            setStatus('ACCESS_ERROR');
        }
    };

    const handleCapture = () => {
        if (!canvasRef.current || !cameraActive) return;
        const link = document.createElement('a');
        link.download = `VISION_BENT_${Date.now()}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="fixed inset-0 bg-black text-emerald-500 font-mono overflow-hidden select-none touch-none">
            <GlitchStyles />
            <video ref={videoRef} autoPlay playsInline muted className="hidden" />
            <canvas ref={bufferCanvasRef} className="hidden" />
            
            {/* VIEWPORT */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${cameraActive ? 'opacity-100' : 'opacity-0'}`}>
                <canvas ref={canvasRef} className="w-full h-full object-cover pixelated" />
                
                {/* HUD: TITLE BAR */}
                <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-50 pointer-events-none">
                    <div className="space-y-1">
                        <h1 className="text-[10px] font-black tracking-[0.4em] uppercase text-white/80">onSET GLITCH_CAM</h1>
                        <div className="flex items-center gap-2 text-[7px] font-black text-emerald-500/40 tracking-[0.2em] uppercase">
                            <Activity size={10} className="animate-pulse" />
                            {bentMode ? 'SYSTEM_FAIL: CIRCUIT_BENT' : 'Optical Link: v0.1.2'}
                        </div>
                    </div>
                </div>

                {/* VISUAL OVERLAYS */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-30" />
                <div className="absolute inset-0 pointer-events-none crt-overlay opacity-30 z-20" />
            </div>

            {/* CLICK TO ACTIVATE FALLBACK */}
            {!cameraActive && status === 'CLICK_ACTIVATE' && (
                <div className="absolute inset-0 flex items-center justify-center z-[110] bg-black">
                    <button onClick={startCamera} className="flex flex-col items-center gap-4 p-10 border border-emerald-500/20 rounded-full hover:bg-emerald-500/5 transition-all">
                        <Power size={32} className="text-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Initialize Optics</span>
                    </button>
                </div>
            )}

            {/* HUD CONTROLS TOGGLE */}
            {cameraActive && (
                <button 
                    onClick={() => setShowControls(!showControls)}
                    className="absolute top-6 right-6 p-3 bg-black/40 backdrop-blur border border-white/5 rounded-full text-white/30 z-[120] hover:text-white transition-all shadow-2xl"
                >
                    {showControls ? <X size={16} /> : <Command size={16} />}
                </button>
            )}

            {/* FLOATING MINIMALPOD */}
            <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-[80%] max-w-[280px] transition-all duration-700 ease-in-out transform z-[100] ${showControls && cameraActive ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-32 opacity-0 scale-90 pointer-events-none'}`}>
                <div className="glass-panel p-6 rounded-[2.5rem] space-y-5 shadow-2xl">
                    
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <div className="flex justify-between text-[7px] font-black uppercase text-emerald-500/40 tracking-widest pl-1">
                                <span>Core Thrust</span>
                                <span>{intensity}%</span>
                            </div>
                            <input type="range" min="0" max="100" value={intensity} onChange={(e) => setIntensity(parseInt(e.target.value))} className="w-full h-1 bg-white/5 rounded-full appearance-none accent-emerald-500 cursor-pointer" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[7px] font-black uppercase text-red-500/70 tracking-widest pl-1">
                                <span>Wave Decay</span>
                                <span>{degradation}%</span>
                            </div>
                            <input type="range" min="0" max="100" value={degradation} onChange={(e) => setDegradation(parseInt(e.target.value))} className="w-full h-1 bg-white/5 rounded-full appearance-none accent-red-500 cursor-pointer" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setVhsMode(!vhsMode)} className={`flex items-center justify-center gap-1.5 py-2.5 border rounded-2xl transition-all ${vhsMode ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-white/5 text-zinc-600 hover:bg-white/5'}`}>
                            <Monitor size={12} />
                            <span className="text-[7px] font-black uppercase">VHS</span>
                        </button>
                        <button onClick={() => setBentMode(!bentMode)} className={`flex items-center justify-center gap-1.5 py-2.5 border rounded-2xl transition-all ${bentMode ? 'bg-red-500 text-black border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/5 text-zinc-600 hover:bg-white/5'}`}>
                            <FileWarning size={12} />
                            <span className="text-[7px] font-black uppercase">BENT</span>
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => { setIntensity(50); setDegradation(10); setVhsMode(false); setBentMode(false); }} className="p-3 bg-white/5 text-zinc-700 rounded-2xl hover:text-zinc-500 transition-colors">
                            <RotateCcw size={14} />
                        </button>
                        <button onClick={handleCapture} className="flex-1 flex items-center justify-center gap-3 py-3 bg-emerald-500 text-black rounded-3xl font-black text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/10 hover:bg-emerald-400 active:scale-[0.95] transition-all">
                            <Camera size={14} /> Snap Shot
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
