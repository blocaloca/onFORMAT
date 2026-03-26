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
    Power
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
        .glass-panel { background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); }
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

    // Render Loop
    useEffect(() => {
        let frameId: number;
        const render = () => {
            if (cameraActive && videoRef.current && canvasRef.current && bufferCanvasRef.current) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                const buffer = bufferCanvasRef.current;
                const ctx = canvas.getContext('2d');
                const bCtx = buffer.getContext('2d');

                if (ctx && bCtx) {
                    if (canvas.width !== video.videoWidth) {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                    }

                    // Pixelation Logic
                    const pScale = degradation > 20 ? (1 / (1 + (degradation / 8))) : 1;
                    buffer.width = canvas.width * pScale;
                    buffer.height = canvas.height * pScale;

                    bCtx.drawImage(video, 0, 0, buffer.width, buffer.height);

                    ctx.save();
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Transforms
                    ctx.translate(canvas.width / 2, canvas.height / 2);
                    const skew = (degradation > 60 || bentMode) ? ((degradation - 50) * Math.PI / 180) : 0;
                    ctx.transform(1 + (degradation / 200), 0, Math.tan(skew), 1 + (degradation / 200), 0, 0);
                    ctx.translate(-canvas.width / 2, -canvas.height / 2);

                    // Filters
                    const hue = intensity * 3.6;
                    const contrast = 200 + intensity;
                    const sepia = vhsMode ? 'sepia(0.6) saturate(2.5)' : '';
                    ctx.filter = `grayscale(100%) contrast(${contrast}%) brightness(140%) hue-rotate(${hue}deg) ${sepia}`;

                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
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
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
                setStatus('OPTIMIZING_STREAM');
            }
        } catch (e) {
            setStatus('ACCESS_DENIED');
        }
    };

    const handleCapture = () => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        link.download = `onSET_GLITCH_${Date.now()}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="fixed inset-0 bg-black text-emerald-500 font-mono overflow-hidden">
            <GlitchStyles />
            <video ref={videoRef} autoPlay playsInline className="hidden" />
            <canvas ref={bufferCanvasRef} className="hidden" />
            
            {/* VIEWPORT */}
            <div className={`absolute inset-0 transition-all ${degradation > 80 ? 'jitter' : ''}`}>
                {cameraActive ? (
                    <canvas 
                        ref={canvasRef} 
                        className="w-full h-full object-cover pixelated opacity-90"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-8 z-10 px-12">
                        <div className="relative">
                            <ShieldAlert size={80} className="text-emerald-950 animate-pulse" />
                            <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full" />
                        </div>
                        <div className="text-center space-y-2">
                            <h1 className="text-[10px] font-black tracking-[0.6em] uppercase text-emerald-900">Vision System Standby</h1>
                            <p className="text-[8px] text-emerald-900/50 uppercase tracking-[0.2em]">Secure optical uplink required</p>
                        </div>
                        <button 
                            onClick={startCamera} 
                            className="group flex flex-col items-center gap-4 p-8 border border-emerald-500/20 rounded-full hover:border-emerald-500 hover:bg-emerald-500/5 transition-all active:scale-[0.95]"
                        >
                            <Power size={32} className="text-emerald-500 group-hover:animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Establish Uplink</span>
                        </button>
                    </div>
                )}

                {/* OVERLAYS */}
                <div className="absolute inset-0 pointer-events-none crt-overlay opacity-40 z-20" />
                <div className="absolute inset-x-0 h-4 bg-emerald-500/5 blur-lg animate-[scanline_8s_linear_infinite] pointer-events-none z-20" />
                
                {/* HUD */}
                <div className="absolute top-10 left-10 flex flex-col gap-2 pointer-events-none z-30 opacity-70">
                    <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em]">
                        <Activity size={16} className="animate-pulse" />
                        {cameraActive ? status : 'IDLE_LINK'}
                    </div>
                </div>

                {cameraActive && (
                    <div className="absolute top-10 right-10 z-50">
                        <button 
                            onClick={() => setShowControls(!showControls)}
                            className="p-4 bg-black/80 backdrop-blur border border-white/10 rounded-full text-white shadow-2xl transition-all active:scale-[0.9]"
                        >
                            {showControls ? <X size={20} /> : <Settings size={20} />}
                        </button>
                    </div>
                )}
            </div>

            {/* FLOATING CONTROLS */}
            {cameraActive && (
                <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 w-[90%] max-w-sm transition-all duration-700 ease-in-out transform z-[100] ${showControls ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-40 opacity-0 scale-90 pointer-events-none'}`}>
                    <div className="glass-panel p-8 rounded-[40px] space-y-8 shadow-[0_0_80px_rgba(0,0,0,1)]">
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[8px] font-black uppercase text-emerald-500/60 tracking-widest">
                                    <span>Signal Gain</span>
                                    <span>{intensity}%</span>
                                </div>
                                <input type="range" min="0" max="100" value={intensity} onChange={(e) => setIntensity(parseInt(e.target.value))} className="w-full h-1 bg-emerald-900/30 rounded-full appearance-none accent-emerald-500 cursor-pointer" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[8px] font-black uppercase text-red-500 tracking-widest">
                                    <span>Wave Corruption</span>
                                    <span>{degradation}%</span>
                                </div>
                                <input type="range" min="0" max="100" value={degradation} onChange={(e) => setDegradation(parseInt(e.target.value))} className="w-full h-1 bg-red-900/30 rounded-full appearance-none accent-red-500 cursor-pointer" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setVhsMode(!vhsMode)}
                                className={`flex flex-col items-center gap-2 p-4 border rounded-3xl transition-all ${vhsMode ? 'bg-white text-black border-white' : 'border-white/10 text-zinc-500 hover:bg-white/5'}`}
                            >
                                <Monitor size={18} />
                                <span className="text-[7px] font-black uppercase tracking-widest">VHS TAPE</span>
                            </button>
                            <button 
                                onClick={() => setBentMode(!bentMode)}
                                className={`flex flex-col items-center gap-2 p-4 border rounded-3xl transition-all ${bentMode ? 'bg-red-500 text-black border-red-500 shadow-lg shadow-red-500/20' : 'border-red-500/20 text-red-900/40 hover:bg-red-500/10'}`}
                            >
                                <FileWarning size={18} />
                                <span className="text-[7px] font-black uppercase tracking-widest">BENT CIRCUIT</span>
                            </button>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => { setIntensity(50); setDegradation(10); setVhsMode(false); setBentMode(false); }}
                                className="p-5 bg-zinc-900 text-zinc-600 rounded-3xl hover:bg-zinc-800 transition-colors"
                            >
                                <RotateCcw size={20} />
                            </button>
                            <button 
                                onClick={handleCapture}
                                className="flex-1 flex items-center justify-center gap-4 p-5 bg-emerald-500 text-black rounded-[28px] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 active:scale-[0.98] transition-all"
                            >
                                <Camera size={20} /> Capture Shot
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
