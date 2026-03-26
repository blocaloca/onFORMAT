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
        .rgb-shift {
            filter: drop-shadow(2px 0 #f00) drop-shadow(-2px 0 #0ff);
        }
    `}</style>
);

export default function GlitchLab() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState('UNAUTHORIZED_ACCESS');
    const [intensity, setIntensity] = useState(50);
    const [noise, setNoise] = useState(20);
    const [cameraActive, setCameraActive] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const statuses = ['DECRYPTING...', 'SIGNAL_LOSS', 'BUFFERING...', 'onSET_LAB', 'DATA_CORRUPTION', 'UNAUTHORIZED_ACCESS'];
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

    return (
        <div className="min-h-screen bg-black text-emerald-500 font-mono p-4 overflow-hidden flex flex-col items-center justify-center selection:bg-emerald-500/30">
            <GlitchStyles />
            
            {/* CRT CONTAINER */}
            <div className="w-full max-w-sm aspect-[3/4] border-2 border-emerald-900/50 rounded-2xl relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)] bg-zinc-950 flex flex-col">
                
                {/* STATUS BAR */}
                <div className="p-3 border-b border-emerald-900/30 flex items-center justify-between text-[10px] bg-zinc-900/50">
                    <div className="flex items-center gap-2">
                        <Activity size={12} className="animate-pulse" />
                        <span className="tracking-widest uppercase">{status}</span>
                    </div>
                    <span className="opacity-50">LAT: 0.12ms</span>
                </div>

                {/* VIEWPORT */}
                <div className="flex-1 relative flex items-center justify-center group overflow-hidden bg-black">
                    {/* CAMERA FEED */}
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${cameraActive ? 'opacity-80' : 'opacity-0'} grayscale sepia contrast-150 brightness-75`}
                        style={{ filter: `hue-rotate(90deg) contrast(${100 + intensity}%)` }}
                    />

                    {/* INTERACTIVE SCANLINES */}
                    <div className="absolute inset-x-0 h-4 bg-emerald-500/10 blur-sm pointer-events-none animate-[scanline_4s_linear_infinite]" />
                    <div className="absolute inset-0 crt-overlay opacity-50 pointer-events-none" />

                    {!cameraActive && (
                        <div className="text-center space-y-4 z-10">
                            <ShieldAlert size={48} className="mx-auto text-emerald-900 animate-pulse" />
                            <p className="text-[10px] tracking-[0.3em] font-black uppercase text-emerald-900">Encrypted Stream</p>
                            <button 
                                onClick={startCamera}
                                className="px-6 py-2 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all"
                            >
                                Init Optical Capture
                            </button>
                        </div>
                    )}

                    {/* HUD OVERLAY */}
                    <div className="absolute top-4 left-4 pointer-events-none">
                        <div className="text-[10px] font-black border-l-2 border-emerald-500 pl-2">
                            A-CAM // ISO 3200<br/>
                            F-STOP // T2.8<br/>
                            SHUTTER // 172.8
                        </div>
                    </div>
                    
                    <div className="absolute bottom-4 right-4 pointer-events-none opacity-30 text-right">
                        <Scan size={32} />
                        <div className="text-[8px] mt-1 font-black uppercase">Tracking Active</div>
                    </div>
                </div>

                {/* CONTROLS */}
                <div className="p-6 bg-zinc-900/50 border-t border-emerald-900/30 space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between text-[9px] font-black uppercase">
                            <span>Signal Intensity</span>
                            <span>{intensity}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={intensity}
                            onChange={(e) => setIntensity(parseInt(e.target.value))}
                            className="w-full accent-emerald-500 bg-emerald-900/20 h-1 rounded-full appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex flex-col items-center gap-2 p-3 border border-emerald-900/50 rounded-xl hover:bg-emerald-500/10 transition-colors group">
                            <Monitor size={16} className="group-hover:text-white" />
                            <span className="text-[8px] font-black uppercase">VHS Mode</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-3 border border-emerald-900/50 rounded-xl hover:bg-emerald-500/10 transition-colors group">
                            <Terminal size={16} className="group-hover:text-white" />
                            <span className="text-[8px] font-black uppercase">Data Leak</span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-emerald-900/10">
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[8px] font-black uppercase opacity-60">Rec Active</span>
                        </div>
                        <Zap size={12} className="text-amber-500" />
                    </div>
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
