'use client';
import React, { useState, useRef, useEffect } from 'react';
import { 
    Zap, 
    Monitor, 
    Camera, 
    RefreshCcw, 
    FileWarning, 
    Terminal, 
    Activity,
    ShieldAlert,
    Scan
} from 'lucide-react';

// STYLING COMPONENT (Inline for the sandbox)
const GlitchStyles = () => (
    <style jsx global>{`
        @keyframes scanline {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
        }
        @keyframes flicker {
            0% { opacity: 0.9; }
            5% { opacity: 0.8; }
            10% { opacity: 0.95; }
            15% { opacity: 0.7; }
            20% { opacity: 0.9; }
            100% { opacity: 1; }
        }
        @keyframes noise {
            0% { transform: translate(0,0); }
            10% { transform: translate(-1px, -1px); }
            20% { transform: translate(1px, 1px); }
            30% { transform: translate(-2px, 2px); }
            40% { transform: translate(2px, -2px); }
            50% { transform: translate(-1px, 1px); }
            100% { transform: translate(0,0); }
        }
        .crt-overlay {
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
            background-size: 100% 2px, 3px 100%;
            pointer-events: none;
        }
        .glitch-text {
            text-shadow: 2px 0 #ff00c1, -2px 0 #00fff9;
        }
        .jitter {
            animation: noise 0.2s infinite;
        }
        .rgb-shift-heavy {
            filter: drop-shadow(var(--shift-x) 0 #f00) drop-shadow(calc(var(--shift-x) * -1) 0 #0ff) contrast(150%) brightness(120%);
        }
        .pixelated {
            image-rendering: pixelated;
        }
        .noise-overlay {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
            opacity: 0.15;
            pointer-events: none;
        }
    `}</style>
);

export default function GlitchLab() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState('UNAUTHORIZED_ACCESS');
    const [intensity, setIntensity] = useState(50);
    const [degradation, setDegradation] = useState(10);
    const [cameraActive, setCameraActive] = useState(false);
    
    // Mode states
    const [vhsMode, setVhsMode] = useState(false);
    const [bentMode, setBentMode] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const statuses = ['SIGNAL_FAILURE', 'CIRCUIT_BENT', 'onSET_LAB', 'RAM_DUMP', 'UNAUTHORIZED_ACCESS'];
            setStatus(statuses[Math.floor(Math.random() * statuses.length)]);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
            }
        } catch (e) {
            console.error("Camera failed", e);
            alert("CAMERA_INIT_FAILED: ACCESS_DENIED");
        }
    };

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas to video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Save context and clear
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. APPLY TRANSFORMS (MATCHING UI)
        // Center for rotation/skew
        ctx.translate(canvas.width / 2, canvas.height / 2);
        
        const skewAmount = (degradation > 60 || bentMode) ? ((degradation - 50) * Math.PI / 180) : 0;
        const scaleAmount = 1 + (degradation / 200);
        
        ctx.transform(scaleAmount, 0, Math.tan(skewAmount), scaleAmount, 0, 0);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        // 2. APPLY FILTERS (MATCHING UI EXACTLY)
        // Note: ctx.filter requires pixels/percent to match CSS exactly
        const hue = intensity * 3.6;
        const contrastVal = 100 + intensity;
        const vhsFilter = vhsMode ? 'sepia(50%) saturate(200%)' : '';
        
        // Base UI filters: grayscale(1) contrast(200%) brightness(150%)
        ctx.filter = `grayscale(100%) contrast(200%) brightness(150%) hue-rotate(${hue}deg) contrast(${contrastVal}%) ${vhsFilter}`;
        
        // 3. DRAW VIDEO
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // 4. RESTORE
        ctx.restore();

        // 5. TRIGGER DOWNLOAD
        const link = document.createElement('a');
        link.download = `onset_vision_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    // Calculate dynamic styles for the glitch
    const shiftX = `${(degradation / (vhsMode ? 3 : 5))}px`;
    const skewX = (degradation > 60 || bentMode) ? `${(degradation - 50)}deg` : '0';
    
    // Intensified Pixelation: Using a scale-down + scale-up trick + image-rendering
    const pixelScale = degradation > 20 ? (1 / (1 + (degradation / 10))) : 1;
    const pixelStyles = degradation > 20 ? {
        transform: `scale(${1 / pixelScale}) skewX(${skewX})`,
        width: `${pixelScale * 100}%`,
        height: `${pixelScale * 100}%`,
        left: `${(1 - pixelScale) * 50}%`,
        top: `${(1 - pixelScale) * 50}%`,
    } : { transform: `skewX(${skewX})` };

    return (
        <div className="min-h-screen bg-black text-emerald-500 font-mono p-4 overflow-hidden flex flex-col items-center justify-center selection:bg-emerald-500/30">
            <GlitchStyles />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="w-full max-w-sm aspect-[3/4] border-2 border-emerald-900/50 rounded-2xl relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)] bg-zinc-950 flex flex-col transition-all duration-75">
                
                <div className="p-3 border-b border-emerald-900/30 flex items-center justify-between text-[10px] bg-zinc-900/50">
                    <div className="flex items-center gap-2">
                        <Activity size={12} className={vhsMode ? "animate-bounce" : "animate-pulse"} />
                        <span className="tracking-widest uppercase">{bentMode ? "SYSTEM_FAILURE" : status}</span>
                    </div>
                </div>

                <div 
                    className={`flex-1 relative flex items-center justify-center overflow-hidden bg-black ${(degradation > 80 || bentMode) ? 'jitter' : ''}`}
                    style={{ '--shift-x': shiftX } as any}
                >
                    <div className="absolute inset-0 noise-overlay z-20 pointer-events-none opacity-20" />
                    
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className={`absolute w-full h-full object-cover transition-all duration-75 ${cameraActive ? 'opacity-80' : 'opacity-0'} grayscale contrast-200 brightness-150 pixelated ${degradation > 20 ? 'rgb-shift-heavy' : ''}`}
                        style={{ 
                            ...pixelStyles,
                            filter: `hue-rotate(${(intensity * 3.6)}deg) contrast(${100 + intensity}%) ${vhsMode ? 'sepia(0.5) saturate(2)' : ''}`,
                        } as any}
                    />

                    {vhsMode && (
                        <div className="absolute inset-0 z-30 pointer-events-none opacity-40">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="h-px bg-white/20 w-full mb-2" />
                            ))}
                        </div>
                    )}

                    <div className="absolute inset-x-0 h-4 bg-emerald-500/10 blur-sm pointer-events-none animate-[scanline_4s_linear_infinite]" />
                    <div className={`absolute inset-0 crt-overlay pointer-events-none ${(degradation > 50 || vhsMode) ? 'opacity-80' : 'opacity-30'}`} />

                    {!cameraActive && (
                        <div className="text-center space-y-4 z-40">
                            <ShieldAlert size={48} className="mx-auto text-emerald-900 animate-pulse" />
                            <button onClick={startCamera} className="px-6 py-2 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">
                                INIT OPTICAL CAPTURE
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-white dark:bg-zinc-900 border-t border-emerald-900/30 space-y-5">
                    <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase opacity-60 text-zinc-400">
                            <span>Process Intensifier</span>
                            <span>{intensity}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={intensity} onChange={(e) => setIntensity(parseInt(e.target.value))} className="w-full accent-emerald-500 bg-emerald-900/20 h-1 rounded-full appearance-none cursor-pointer" />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase text-red-500">
                            <span>Signal Degradation</span>
                            <span>{degradation}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={degradation} onChange={(e) => setDegradation(parseInt(e.target.value))} className="w-full accent-red-500 bg-red-900/20 h-1 rounded-full appearance-none cursor-pointer" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button 
                            onClick={() => setVhsMode(!vhsMode)}
                            className={`flex items-center justify-center gap-2 p-3 border rounded-xl transition-all ${vhsMode ? 'bg-zinc-900 text-white border-zinc-900 shadow-[0_0_15px_rgba(0,0,0,0.1)]' : 'border-zinc-200 hover:bg-zinc-100'}`}
                        >
                            <Monitor size={12} />
                            <span className="text-[8px] font-black uppercase">VHS MODE</span>
                        </button>
                        <button 
                            onClick={() => setBentMode(!bentMode)}
                            className={`flex items-center justify-center gap-2 p-3 border rounded-xl transition-all ${bentMode ? 'bg-red-500 text-white border-red-500 shadow-[0_0_15px_red]' : 'border-red-500/20 hover:bg-red-500/10'}`}
                        >
                            <FileWarning size={12} />
                            <span className="text-[8px] font-black uppercase">BENT CIRCUIT</span>
                        </button>
                    </div>

                    <button 
                        onClick={handleCapture}
                        disabled={!cameraActive}
                        className="w-full flex items-center justify-center gap-3 p-4 bg-emerald-500 text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-emerald-400 active:scale-[0.95] disabled:opacity-30 disabled:grayscale transition-all"
                    >
                        <Camera size={14} /> Capture Vision Shot
                    </button>
                </div>
            </div>

            {/* DECORATIVE TERMINAL FOOTER */}
            <div className="mt-8 text-[9px] uppercase tracking-widest text-emerald-900 max-w-sm w-full space-y-1">
                <p>RUNNING: onset_vision_v0.1.0_sandbox</p>
                <p>SECURITY: KERNEL_PANIC_BYPASS_SUCCESSFUL</p>
                <p className="animate-pulse">_ AWAITING COMMAND...</p>
            </div>
        </div>
    );
}
