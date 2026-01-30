
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { encode, createBlob, decode, decodeAudioData } from '../services/geminiService';

const LiveView: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'error'>('idle');
  const [transcriptions, setTranscriptions] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);
  const transcriptionRef = useRef({ user: '', model: '' });

  const startSession = async () => {
    try {
      setStatus('connecting');
      // Always create a new instance of GoogleGenAI to ensure latest API key usage
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Live connected');
            setStatus('listening');
            setIsActive(true);
            
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Using the createBlob helper for proper audio packaging
              const pcmBlob = createBlob(inputData);
              // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Audio handling
            const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioBase64) {
              const outCtx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              
              // Using decode helper instead of manual decoding
              const buffer = await decodeAudioData(decode(audioBase64), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            // Interrupt handling
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            // Transcription handling
            if (message.serverContent?.inputTranscription) {
              transcriptionRef.current.user += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
              transcriptionRef.current.model += message.serverContent.outputTranscription.text;
            }
            if (message.serverContent?.turnComplete) {
              const u = transcriptionRef.current.user;
              const m = transcriptionRef.current.model;
              if (u || m) {
                setTranscriptions(prev => [...prev, `You: ${u}`, `AI: ${m}`]);
              }
              transcriptionRef.current = { user: '', model: '' };
            }
          },
          onerror: (e) => {
            console.error('Live error:', e);
            setStatus('error');
          },
          onclose: () => {
            console.log('Live closed');
            setIsActive(false);
            setStatus('idle');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: "You are a friendly and helpful voice assistant named Nusa. You respond naturally and concisely. You can speak Indonesian or English."
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsActive(false);
    setStatus('idle');
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-900/40 relative">
      <div className="max-w-md w-full glass rounded-3xl p-10 flex flex-col items-center shadow-2xl border border-white/5">
        <div className="mb-10 relative">
          {/* Pulsing Visualizer */}
          <div className={`
            w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative z-10
            ${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-500
          `}>
            {isActive ? (
              <div className="flex items-end gap-1.5 h-12">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className={`w-1.5 bg-white rounded-full animate-wave h-${i * 2 + 4}`} style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
            )}
          </div>
          {isActive && (
            <>
              <div className="absolute top-0 left-0 w-full h-full rounded-full bg-indigo-500/20 animate-ping"></div>
              <div className="absolute top-0 left-0 w-full h-full rounded-full bg-indigo-500/10 animate-pulse delay-75"></div>
            </>
          )}
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 text-white">
            {isActive ? 'Nusa is Listening...' : 'Talk with Nusa'}
          </h2>
          <p className="text-slate-400">
            {status === 'connecting' ? 'Establishing secure link...' : 
             status === 'error' ? 'Connection failed. Try again.' :
             isActive ? 'Go ahead, ask me anything out loud!' : 'Click the button below to start a conversation.'}
          </p>
        </div>

        <button
          onClick={isActive ? stopSession : startSession}
          disabled={status === 'connecting'}
          className={`
            w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-xl
            ${isActive 
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'}
            ${status === 'connecting' ? 'opacity-50' : ''}
          `}
        >
          {status === 'connecting' ? 'Connecting...' : isActive ? 'End Call' : 'Start Voice Chat'}
        </button>
      </div>

      {transcriptions.length > 0 && (
        <div className="mt-12 w-full max-w-2xl max-h-48 overflow-y-auto space-y-2 p-4 glass rounded-xl text-sm scroll-smooth">
          {transcriptions.map((t, i) => (
            <div key={i} className={`p-2 rounded ${t.startsWith('You:') ? 'text-indigo-300' : 'text-slate-300'}`}>
              {t}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes wave {
          0%, 100% { height: 10px; }
          50% { height: 32px; }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LiveView;
