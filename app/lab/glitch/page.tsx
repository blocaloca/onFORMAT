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
        .glass-panel { background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.05); }
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
                const ctx = canvas.getContext('2d');
                const bCtx = buffer.getContext('2d');

                if (video.videoWidth > 0 && ctx && bCtx) {
                    if (canvas.width !== video.videoWidth) {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                    }

                    // Pixelation Logic
                    const pScale = degradation > 20 ? (0.5 / (1 + (degradation / 6))) : 1;
                    const bWidth = Math.max(1, canvas.width * pScale);
                    const bHeight = Math.max(1, canvas.height * pScale);
                    
                    if (buffer.width !== bWidth) buffer.width = bWidth;
                    if (buffer.height !== bHeight) buffer.height = bHeight;

                    bCtx.drawImage(video, 0, 0, buffer.width, buffer.height);

                    ctx.save();
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    ctx.translate(canvas.width / 2, canvas.height / 2);
                    const skew = (degradation > 60 || bentMode) ? ((degradation - 50) * Math.PI / 180) : 0;
                    ctx.transform(1 + (degradation / 200), 0, Math.tan(skew), 1 + (degradation / 200), 0, 0);
                    ctx.translate(-canvas.width / 2, -canvas.height / 2);

                    const hue = intensity * 3.6;
                    // AGGRESSIVE CONTRAST & SATURATION for 'process intensifier'
                    const contrastVal = 100 + (intensity * 3);
                    const saturationVal = 100 + (intensity * 4);
                    const sepia = vhsMode ? 'sepia(80%) saturate(300%)' : '';
                    
                    try {
                        ctx.filter = `contrast(${contrastVal}%) saturate(${saturationVal}%) hue-rotate(${hue}deg) ${sepia}`.trim();
                        if (!vhsMode && !bentMode && intensity < 20) {
                            ctx.filter += " grayscale(100%)";
                        }
                    } catch (e) {}

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
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    setCameraActive(true);
                    setStatus('UPLINK_LIVE');
                };
            }
        } catch (e) {
            setStatus('ACCESS_ERROR');
        }
    };

    const handleCapture = () => {
        if (!canvasRef.current || !cameraActive) return;
        const link = document.createElement('a');
        link.download = `onSET_GLITCH_${Date.now()}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="fixed inset-0 bg-black text-emerald-500 font-mono overflow-hidden select-none touch-none">
            <GlitchStyles />
            <video ref={videoRef} autoPlay playsInline muted className="hidden" />
            <canvas ref={bufferCanvasRef} className="hidden" />
            
            {/* VIEWPORT AREA */}
            <div className={`absolute inset-0 transition-all ${degradation > 80 ? 'jitter' : ''}`}>
                {cameraActive ? (
                    <canvas ref={canvasRef} className="w-full h-full object-cover pixelated opacity-90" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-black">
                        <Activity size={32} className="animate-spin text-emerald-950 mb-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-950">Initializing Optical Core...</span>
                    </div>
                )}

                {/* VISUAL LAYERS */}
                <div className="absolute inset-0 pointer-events-none crt-overlay opacity-30 z-20" />
                <div className="absolute inset-x-0 h-[2px] bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-[scanline_10s_linear_infinite] pointer-events-none z-20 opacity-50" />
                
                {/* HUD: TITLE BAR */}
                <div className="absolute top-0 inset-x-0 p-8 flex items-center justify-between z-50 pointer-events-none">
                    <div className="space-y-1">
                        <h1 className="text-[11px] font-black tracking-[0.4em] uppercase text-white text-glow">onSET GLITCH_CAM</h1>
                        <div className="flex items-center gap-2 text-[8px] font-bold text-emerald-500/50 tracking-widest uppercase">
                            <Activity size={10} className="animate-pulse" />
                            Signal: {cameraActive ? 'Uplink Stable' : 'Awaiting Data'}
                        </div>
                    </div>
                    {cameraActive && (
                        <div className="pointer-events-auto">
                            <button onClick={() => setShowControls(!showControls)} className="p-3 bg-white/5 border border-white/10 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-all shadow-2xl">
                                {showControls ? <X size={16} /> : <Command size={16} />}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* FLOATING CONTROL POD (MINIMAL & TRANSPARENT) */}
            {cameraActive && (
                <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-[85%] max-w-[300px] transition-all duration-700 ease-in-out transform z-[100] ${showControls ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-40 opacity-0 scale-90 pointer-events-none'}`}>
                    <div className="glass-panel p-5 rounded-[2.5rem] space-y-5 shadow-2xl">
                        
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-[7px] font-black uppercase text-emerald-500/40 tracking-widest pr-1">
                                    <span>Color Thrust</span>
                                    <span>{intensity}%</span>
                                </div>
                                <input type="range" min="0" max="100" value={intensity} onChange={(e) => setIntensity(parseInt(e.target.value))} className="w-full h-[3px] bg-emerald-900/20 rounded-full appearance-none accent-emerald-500 cursor-pointer" />
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-[7px] font-black uppercase text-red-500/70 tracking-widest pr-1">
                                    <span>Data Corruption</span>
                                    <span>{degradation}%</span>
                                </div>
                                <input type="range" min="0" max="100" value={degradation} onChange={(e) => setDegradation(parseInt(e.target.value))} className="w-full h-[3px] bg-red-900/20 rounded-full appearance-none accent-red-500 cursor-pointer" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setVhsMode(!vhsMode)} className={`flex items-center justify-center gap-1.5 py-2.5 border rounded-2xl transition-all ${vhsMode ? 'bg-white text-black border-white' : 'border-white/5 text-zinc-500 hover:bg-white/5'}`}>
                                <Monitor size={12} />
                                <span className="text-[7px] font-black uppercase">VHS</span>
                            </button>
                            <button onClick={() => setBentMode(!bentMode)} className={`flex items-center justify-center gap-1.5 py-2.5 border rounded-2xl transition-all ${bentMode ? 'bg-red-500 text-black border-red-500' : 'border-red-500/10 text-red-900/40 hover:bg-red-500/5'}`}>
                                <FileWarning size={12} />
                                <span className="text-[7px] font-black uppercase">BENT</span>
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => { setIntensity(50); setDegradation(10); setVhsMode(false); setBentMode(false); }} className="px-4 py-3 bg-zinc-900/50 text-zinc-700 rounded-2xl hover:text-zinc-500 transition-colors">
                                <RotateCcw size={14} />
                            </button>
                            <button onClick={handleCapture} className="flex-1 flex items-center justify-center gap-3 py-3 bg-emerald-500 text-black rounded-3xl font-black text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/10 hover:bg-emerald-400 active:scale-[0.95] transition-all">
                                <Camera size={14} /> Capture
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
