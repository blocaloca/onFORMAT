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
    RotateCcw
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
        .glass-panel { background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
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
    const [status, setStatus] = useState('READY_SYSTEM');

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
                    // Match dimensions
                    if (canvas.width !== video.videoWidth) {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                    }

                    // Pixelation Logic: Reduce buffer size
                    const pScale = degradation > 20 ? (1 / (1 + (degradation / 8))) : 1;
                    buffer.width = canvas.width * pScale;
                    buffer.height = canvas.height * pScale;

                    // 1. Draw video to buffer (downscaled)
                    bCtx.drawImage(video, 0, 0, buffer.width, buffer.height);

                    // 2. Clear main
                    ctx.save();
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // 3. Transformations
                    ctx.translate(canvas.width / 2, canvas.height / 2);
                    const skew = (degradation > 60 || bentMode) ? ((degradation - 50) * Math.PI / 180) : 0;
                    ctx.transform(1 + (degradation / 200), 0, Math.tan(skew), 1 + (degradation / 200), 0, 0);
                    ctx.translate(-canvas.width / 2, -canvas.height / 2);

                    // 4. Filters (BAKED INTO CANVAS)
                    const hue = intensity * 3.6;
                    const contrast = 200 + intensity;
                    const sepia = vhsMode ? 'sepia(0.6) saturate(2.5)' : '';
                    ctx.filter = `grayscale(100%) contrast(${contrast}%) brightness(140%) hue-rotate(${hue}deg) ${sepia}`;

                    // 5. Draw buffer to main (upscaled)
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
                setStatus('STREAMING_OPTICAL');
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
            
            {/* FULLSCREEN VIEWPORT */}
            <div className={`absolute inset-0 flex items-center justify-center bg-black transition-all ${degradation > 80 ? 'jitter' : ''}`}>
                {cameraActive ? (
                    <canvas 
                        ref={canvasRef} 
                        className="w-full h-full object-cover pixelated opacity-80"
                    />
                ) : (
                    <div className="text-center space-y-8 z-10 px-12">
                        <ShieldAlert size={64} className="mx-auto text-emerald-900 animate-pulse" />
                        <div className="space-y-2">
                            <h1 className="text-xs font-black tracking-[0.5em] uppercase text-emerald-900">Vision System Standby</h1>
                            <p className="text-[10px] text-emerald-900/50 uppercase">Restricted access protocol enabled</p>
                        </div>
                        <button 
                            onClick={startCamera} 
                            className="px-8 py-4 border-2 border-emerald-500/20 text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all active:scale-[0.95]"
                        >
                            Establish Uplink
                        </button>
                    </div>
                )}

                {/* VISUAL OVERLAYS */}
                <div className="absolute inset-0 pointer-events-none crt-overlay opacity-40" />
                <div className="absolute inset-x-0 h-8 bg-emerald-500/5 blur-xl animate-[scanline_6s_linear_infinite] pointer-events-none" />
                
                {/* HUD ELEMENTS */}
                <div className="absolute top-6 left-6 flex flex-col gap-1 pointer-events-none opacity-60">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Activity size={14} className="animate-pulse" />
                        {status}
                    </div>
                    <span className="text-[8px] opacity-50">FREQ // 24.97FPS</span>
                </div>

                <div className="absolute top-6 right-6 flex items-center gap-4">
                    <button 
                        onClick={() => setShowControls(!showControls)}
                        className="p-3 bg-black/50 backdrop-blur border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-all"
                    >
                        {showControls ? <X size={18} /> : <Settings size={18} />}
                    </button>
                </div>
            </div>

            {/* FLOATING CONTROLS PANEL */}
            <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm transition-all duration-500 transform ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
                <div className="glass-panel p-6 rounded-3xl space-y-6 shadow-2xl shadow-emerald-500/5">
                    
                    {/* SLIDERS */}
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-black uppercase text-emerald-500/60">
                                <span>Signal Gain</span>
                                <span>{intensity}%</span>
                            </div>
                            <input type="range" min="0" max="100" value={intensity} onChange={(e) => setIntensity(parseInt(e.target.value))} className="w-full h-1 bg-emerald-900/30 rounded-full appearance-none accent-emerald-500 cursor-pointer" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-black uppercase text-red-500">
                                <span>Wave Corruption</span>
                                <span>{degradation}%</span>
                            </div>
                            <input type="range" min="0" max="100" value={degradation} onChange={(e) => setDegradation(parseInt(e.target.value))} className="w-full h-1 bg-red-900/30 rounded-full appearance-none accent-red-500 cursor-pointer" />
                        </div>
                    </div>

                    {/* MODES */}
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setVhsMode(!vhsMode)}
                            className={`flex flex-col items-center gap-1.5 p-3 border rounded-2xl transition-all ${vhsMode ? 'bg-white text-black border-white' : 'border-white/10 text-zinc-400 hover:bg-white/5'}`}
                        >
                            <Monitor size={16} />
                            <span className="text-[8px] font-black uppercase">VHS TAPE</span>
                        </button>
                        <button 
                            onClick={() => setBentMode(!bentMode)}
                            className={`flex flex-col items-center gap-1.5 p-3 border rounded-2xl transition-all ${bentMode ? 'bg-red-500 text-black border-red-500' : 'border-red-500/20 text-red-900/60 hover:bg-red-500/10'}`}
                        >
                            <FileWarning size={16} />
                            <span className="text-[8px] font-black uppercase">CIRCUIT BENT</span>
                        </button>
                    </div>

                    {/* CAPTURE */}
                    <div className="flex gap-3">
                        <button 
                            onClick={() => { setIntensity(50); setDegradation(10); setVhsMode(false); setBentMode(false); }}
                            className="p-4 bg-zinc-900 text-zinc-500 rounded-2xl hover:bg-zinc-800 transition-colors"
                        >
                            <RotateCcw size={18} />
                        </button>
                        <button 
                            onClick={handleCapture}
                            disabled={!cameraActive}
                            className="flex-1 flex items-center justify-center gap-3 p-4 bg-emerald-500 text-black rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-20 transition-all"
                        >
                            <Camera size={16} /> Capture Vision
                        </button>
                    </div>
                </div>
            </div>

            {/* SCANNING LINES HUD (DECORATIVE) */}
            <div className="absolute bottom-6 left-6 pointer-events-none opacity-20">
                <Scan size={32} />
            </div>
        </div>
    );
}
