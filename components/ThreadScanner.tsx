import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  ArrowLeft, 
  ArrowRight, 
  ScanLine, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Info,
  Trash2,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Step, ScanConfig, AnalysisResult, SavedScan } from '../types';
import { analyzeThread } from '../services/geminiService';

const ThreadScanner: React.FC<{ onSave: (scan: SavedScan) => void }> = ({ onSave }) => {
  const [step, setStep] = useState<Step>(Step.CONFIGURE);
  const [captureMode, setCaptureMode] = useState<'camera' | 'upload'>('camera');
  const [config, setConfig] = useState<ScanConfig>({
    connectionStandard: 'API (Standard)',
    connectionGender: 'Pin (Male)',
    connectionType: '',
    threadCategory: 'Shouldered Threads',
    threadType: '',
    product: '',
    frameCount: 8
  });
  const [images, setImages] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    async function setupCamera() {
      if (step === Step.CAPTURE && captureMode === 'camera') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          streamRef.current = stream;
          setHasCameraPermission(true);
          setError(null);
        } catch (err) {
          console.error("Camera error:", err);
          setHasCameraPermission(false);
          setError("Unable to access camera. Switching to Upload mode.");
          setCaptureMode('upload');
        }
      } else {
        stopCamera();
      }
    }
    setupCamera();
    return () => stopCamera();
  }, [step, captureMode, stopCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const newImages = [...images, dataUrl];
        setImages(newImages);
        
        if (newImages.length >= config.frameCount) {
          setTimeout(() => setStep(Step.REVIEW), 500);
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = config.frameCount - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots) as File[];

    const promises = filesToProcess.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(newBase64Images => {
      const updatedImages = [...images, ...newBase64Images];
      setImages(updatedImages);
      if (updatedImages.length >= config.frameCount) {
        setStep(Step.REVIEW);
      }
    });
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeThread(config, images);
      setAnalysisResult(result);
      setStep(Step.REPORT);
      
      // Save to history
      onSave({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        config: config,
        result: result,
        thumbnail: images[0]
      });

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const resetScanner = () => {
    setStep(Step.CONFIGURE);
    setImages([]);
    setAnalysisResult(null);
    setError(null);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-10 px-4 max-w-xl mx-auto">
      {[Step.CONFIGURE, Step.CAPTURE, Step.REVIEW, Step.REPORT].map((s) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
              step === s ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100' : 
              step > s ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500' // Changed from emerald-500 to blue-500 for consistency
            }`}>
              {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
            </div>
            <span className={`text-[10px] mt-2 font-semibold uppercase tracking-wider ${
              step >= s ? 'text-slate-900' : 'text-slate-400'
            }`}>
              {s === 1 ? 'Config' : s === 2 ? 'Capture' : s === 3 ? 'Review' : 'Report'}
            </span>
          </div>
          {s < 4 && (
            <div className={`flex-1 h-1 mx-2 rounded-full ${
              step > s ? 'bg-blue-500' : 'bg-slate-200' // Changed from emerald-500 to blue-500 for consistency
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      {renderStepIndicator()}

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
        {error && (
          <div className="bg-red-50 border-b border-red-200 p-4 flex items-start gap-3 text-red-700 animate-in slide-in-from-top">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm font-medium">{error}</div>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">&times;</button>
          </div>
        )}

        {/* Step 1: CONFIGURE */}
        {step === Step.CONFIGURE && (
          <div className="p-8 flex-grow">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Configure Inspection</h2>
              <p className="text-slate-500">Provide high-accuracy technical specifications for the AI scan engine.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Product Identifier</label>
                  <input 
                    type="text"
                    placeholder="e.g. Drill Pipe #4502"
                    value={config.product} 
                    onChange={(e) => setConfig(c => ({...c, product: e.target.value}))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Connection Standard</label>
                  <select 
                    value={config.connectionStandard} 
                    onChange={(e) => setConfig(c => ({...c, connectionStandard: e.target.value}))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option>API (Standard)</option>
                    <option>DS-1 (High Inspection)</option>
                    <option>Premium (Proprietary/High Performance)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Connection Gender</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Pin (Male)', 'Box (Female)'].map(gender => (
                      <button
                        key={gender}
                        onClick={() => setConfig(c => ({...c, connectionGender: gender}))}
                        className={`py-3 px-4 rounded-xl border font-semibold transition-all ${
                          config.connectionGender === gender 
                            ? 'bg-blue-50 border-blue-600 text-blue-700' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Connection Type</label>
                  <input 
                    type="text"
                    placeholder="e.g. 4-1/2 IF"
                    value={config.connectionType} 
                    onChange={(e) => setConfig(c => ({...c, connectionType: e.target.value}))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Thread Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Shouldered Threads', 'Tapered Threads'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setConfig(c => ({...c, threadCategory: cat}))}
                        className={`py-3 px-4 rounded-xl border font-semibold transition-all ${
                          config.threadCategory === cat 
                            ? 'bg-blue-50 border-blue-600 text-blue-700' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Thread Type</label>
                  <input 
                    type="text"
                    placeholder="e.g. 2-3/8 EUE"
                    value={config.threadType} 
                    onChange={(e) => setConfig(c => ({...c, threadType: e.target.value}))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Precision (Frames)</label>
                  <div className="flex gap-4">
                    {[4, 8, 12].map(num => (
                      <button
                        key={num}
                        onClick={() => setConfig(c => ({...c, frameCount: num}))}
                        className={`flex-1 py-3 rounded-xl border font-bold transition-all ${
                          config.frameCount === num 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 items-start">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    Detailed thread specifications assist the AI in distinguishing between intentional thread forms and actual defects.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: CAPTURE / UPLOAD */}
        {step === Step.CAPTURE && (
          <div className={`p-6 flex flex-col h-full ${captureMode === 'camera' ? 'bg-slate-900' : 'bg-slate-50'}`}>
            <div className="flex justify-between items-center mb-6 px-2">
              <div className={captureMode === 'camera' ? 'text-white' : 'text-slate-900'}>
                <h2 className="text-lg font-bold">Image Acquisition</h2>
                <p className={`${captureMode === 'camera' ? 'text-slate-400' : 'text-slate-500'} text-xs font-medium`}>
                  {images.length} of {config.frameCount} frames {captureMode === 'camera' ? 'captured' : 'uploaded'}
                </p>
              </div>
              <div className="flex bg-slate-200 p-1 rounded-lg">
                <button 
                  onClick={() => setCaptureMode('camera')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    captureMode === 'camera' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Camera
                </button>
                <button 
                  onClick={() => setCaptureMode('upload')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    captureMode === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </button>
              </div>
            </div>

            {captureMode === 'camera' ? (
              <div className="flex flex-col h-full">
                <div className="relative aspect-video md:aspect-[16/9] bg-black rounded-2xl overflow-hidden ring-4 ring-slate-800">
                  <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover" 
                    autoPlay 
                    muted 
                    playsInline 
                  />
                  <div className="absolute inset-0 border-2 border-white/20 pointer-events-none" />
                  <div className="absolute top-1/2 left-0 right-0 border-t border-blue-400/50 pointer-events-none shadow-[0_0_15px_rgba(96,165,250,0.5)] animate-pulse" />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute bottom-4 left-4 flex gap-2 overflow-x-auto pb-2 max-w-[80%] scrollbar-hide">
                    {images.map((img, i) => (
                      <div key={i} className="w-12 h-12 rounded-lg border-2 border-emerald-500 overflow-hidden flex-shrink-0 animate-in zoom-in">
                        <img src={img} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-center">
                  <button 
                    onClick={handleCapture}
                    disabled={images.length >= config.frameCount}
                    className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl active:scale-95"
                  >
                    <div className="absolute inset-0 rounded-full border-4 border-slate-300 scale-110 group-hover:scale-125 transition-transform" />
                    <Camera className="w-8 h-8 text-slate-900" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-xl aspect-[16/9] border-4 border-dashed border-slate-300 rounded-3xl bg-white hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer flex flex-col items-center justify-center p-8 text-center group"
                >
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                    <ImageIcon className="w-10 h-10 text-slate-400 group-hover:text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Upload inspection frames</h3>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
                  <button className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg">Browse Files</button>
                </div>
                {images.length > 0 && (
                  <div className="mt-8 w-full max-w-xl">
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                      {images.map((img, i) => (
                        <div key={i} className="relative w-24 h-24 rounded-xl border-2 border-slate-200 overflow-hidden flex-shrink-0 shadow-sm group">
                          <img src={img} className="w-full h-full object-cover" />
                          <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: REVIEW */}
        {step === Step.REVIEW && (
          <div className="p-8">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Review Frames</h2>
                <p className="text-slate-500">Verify image clarity before starting AI analysis.</p>
              </div>
              <button onClick={() => setImages([])} className="text-red-500 text-sm font-semibold hover:underline flex items-center gap-1">
                <Trash2 className="w-4 h-4" /> Clear All
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {images.map((img, i) => (
                <div key={i} className="group relative aspect-square bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200">
                  <img src={img} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">FRAME {i + 1}</div>
                  <button onClick={() => removeImage(i)} className="absolute top-2 right-2 bg-red-500/80 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {images.length < config.frameCount && (
                <button onClick={() => setStep(Step.CAPTURE)} className="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
                  <Camera className="w-8 h-8 mb-2" />
                  <span className="text-xs font-bold">Add Frame</span>
                </button>
              )}
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-4">
              <div className="bg-blue-600 text-white p-2 rounded-lg"><ScanLine className="w-6 h-6" /></div>
              <div className="flex-grow">
                <p className="text-sm font-bold text-blue-900">Ready for Gemini Pro Analysis</p>
                <p className="text-xs text-blue-700">Detailed surface mapping and defect classification.</p>
              </div>
              <button onClick={handleAnalyze} disabled={isAnalyzing || images.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 transition-all flex items-center gap-2">
                {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                {isAnalyzing ? 'Analyzing...' : 'Start Scan'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: REPORT */}
        {step === Step.REPORT && analysisResult && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Inspection Report</h2>
                <p className="text-slate-500 text-sm">Generated on {new Date().toLocaleDateString()} via AI Analysis</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm ${
                analysisResult.findings.length === 0 ? 'bg-emerald-100 text-emerald-700' : 
                analysisResult.findings.some(f => f.severity === 'High') ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {analysisResult.findings.length === 0 ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {analysisResult.findings.length === 0 ? 'PASS' : 'ACTION REQUIRED'}
              </div>
            </div>
            <div className="mb-8 p-5 bg-slate-900 text-white rounded-2xl shadow-inner">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Overall Summary</h3>
              <p className="text-lg leading-relaxed">{analysisResult.summary}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Spatial Mapping</h4>
                <div className="relative aspect-square bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center p-8">
                  <div className="w-full h-full rounded-full border-[16px] border-slate-200 relative flex items-center justify-center">
                    <div className="w-3/4 h-3/4 rounded-full border border-slate-200 bg-white shadow-inner flex flex-col items-center justify-center text-center p-4">
                      <span className="text-slate-400 text-[10px] font-bold uppercase">Thread Bore</span>
                    </div>
                    {images.map((src, idx) => {
                      const angle = (idx / images.length) * 2 * Math.PI - Math.PI / 2;
                      const radius = 50;
                      const x = 50 + radius * Math.cos(angle);
                      const y = 50 + radius * Math.sin(angle);
                      const hasFinding = analysisResult.findings.some(f => f.frameIndex === idx);
                      return (
                        <div key={idx} className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
                          <div className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all shadow-md group ${
                            hasFinding ? 'border-red-500 scale-110 z-10' : 'border-white'
                          }`}>
                            <img src={src} className="w-full h-full object-cover" />
                            {hasFinding && <div className="absolute inset-0 bg-red-500/20 animate-pulse" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Technical Findings ({analysisResult.findings.length})</h4>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {analysisResult.findings.length === 0 ? (
                    <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-100">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                      <p className="text-emerald-800 font-bold">No Defects Detected</p>
                      <p className="text-emerald-600 text-sm">Thread surfaces appear clean.</p>
                    </div>
                  ) : (
                    analysisResult.findings.map((finding, idx) => (
                      <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="flex justify-between mb-2">
                          <span className="sm font-bold">{finding.defectType}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight ${
                            finding.severity === 'High' ? 'bg-red-100 text-red-700' : 
                            finding.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {finding.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mb-3">{finding.description}</p>
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 overflow-hidden">
                             <img src={images[finding.frameIndex]} className="w-full h-full object-cover" />
                           </div>
                           <span className="text-[10px] font-bold text-slate-400">FRAME {finding.frameIndex + 1}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="mt-auto border-t border-slate-100 bg-slate-50 p-6 flex justify-between items-center">
          <button 
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            disabled={step === Step.CONFIGURE || isAnalyzing}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          {step === Step.REPORT ? (
            <button onClick={resetScanner} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95">
              <RotateCcw className="w-4 h-4" />
              New Inspection
            </button>
          ) : step === Step.CONFIGURE ? (
            <button onClick={() => setStep(Step.CAPTURE)} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95">
              Begin Scan
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : step === Step.CAPTURE && images.length > 0 ? (
             <button onClick={() => setStep(Step.REVIEW)} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95">
              Review Captures
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ThreadScanner;