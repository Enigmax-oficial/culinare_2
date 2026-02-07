import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, LiveServerMessage } from '@google/genai';
import { Mic, MicOff, ArrowLeft, Loader2, Volume2, ChefHat } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { createBlob, decode, decodeAudioData } from '../services/audioUtils';

export default function LiveAssistant() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [connected, setConnected] = useState(false);
  const [isError, setIsError] = useState(false);
  
  // Audio Context Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Visualizer Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startSession = async () => {
    if (!process.env.API_KEY) {
      alert("API Key missing");
      return;
    }

    try {
      setIsError(false);
      
      // 1. Setup Audio Contexts
      // Force a simpler context setup
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;
      
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination); 

      // 2. Setup Mic Stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // 3. Setup GenAI Client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // 4. Connect
      // Note: Using string 'AUDIO' for modality to prevent enum version mismatch issues with CDN
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log("Session Opened");
            setConnected(true);

            const source = inputCtx.createMediaStreamSource(stream);
            
            // Visualizer Setup
            const analyser = inputCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;
            drawVisualizer();

            // Processor
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio) {
              const ctx = outputAudioContextRef.current;
              if (!ctx) return;

              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                ctx,
                24000,
                1
              );

              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(src => {
                src.stop();
                sourcesRef.current.delete(src);
              });
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            console.log("Session Closed");
            setConnected(false);
          },
          onerror: (err) => {
            console.error("Session Error", err);
            setIsError(true);
            setConnected(false);
          }
        },
        config: {
          responseModalities: ['AUDIO' as any], // Cast to any to bypass type check if Enum is missing
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: { parts: [{ text: "You are Chef Em Casa, a helpful culinary assistant. Keep answers concise. Language: Portuguese (Brazil)." }] },
        },
      });

    } catch (e) {
      console.error("Connection Failed", e);
      setIsError(true);
    }
  };

  const stopSession = () => {
    if (inputAudioContextRef.current) inputAudioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    setConnected(false);
    window.location.reload(); 
  };

  const drawVisualizer = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 50;

      let sum = 0;
      for(let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const scale = 1 + (average / 256) * 0.5;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * scale, 0, 2 * Math.PI);
      ctx.fillStyle = connected ? '#f97316' : '#d6d3d1';
      ctx.fill();
      
      if (connected) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius * scale * 1.5, 0, 2 * Math.PI);
          ctx.strokeStyle = `rgba(249, 115, 22, ${0.3 * (average/100)})`;
          ctx.lineWidth = 2;
          ctx.stroke();
      }
    };

    draw();
  };

  useEffect(() => {
    if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = 400;
    }
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] relative">
      <div className="px-4 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 z-10">
           <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Beta</span>
             <h1 className="font-black text-stone-900">{t('assistant_title')}</h1>
        </div>
        <div className="w-10"></div> 
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

        <div className="z-10 text-center mb-8">
            <div className="w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center mx-auto mb-6 relative">
                 <ChefHat size={48} className={connected ? "text-orange-500" : "text-stone-300"} />
                 {connected && (
                     <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                     </span>
                 )}
            </div>
            
            <h2 className="text-2xl font-bold text-stone-800 mb-2">
                {connected ? t('assistant_listening') : t('assistant_ready')}
            </h2>
            <p className="text-stone-500 text-sm max-w-xs mx-auto">
                {connected 
                    ? t('assistant_active_desc')
                    : t('assistant_inactive_desc')}
            </p>
        </div>

        <div className="z-10 mt-8">
            {!connected ? (
                <button 
                    onClick={startSession}
                    className="group relative flex items-center gap-3 bg-stone-900 text-white px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-all"
                >
                    <Mic size={24} />
                    <span>{t('assistant_start')}</span>
                </button>
            ) : (
                <button 
                    onClick={stopSession}
                    className="group relative flex items-center gap-3 bg-red-500 text-white px-8 py-4 rounded-full font-bold shadow-xl hover:bg-red-600 transition-all"
                >
                    <MicOff size={24} />
                    <span>{t('assistant_stop')}</span>
                </button>
            )}
        </div>

        {isError && (
             <div className="absolute bottom-10 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold animate-in slide-in-from-bottom-5">
                 Erro de conexão. Verifique se o microfone está permitido ou recarregue.
             </div>
        )}

      </div>
    </div>
  );
}