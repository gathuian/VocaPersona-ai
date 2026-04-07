import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Settings, 
  User, 
  Upload, 
  Sparkles, 
  PhoneOff, 
  MessageSquare,
  Smile,
  Hand,
  Shirt,
  Image as ImageIcon,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AvatarCanvas } from './components/avatar/AvatarCanvas';
import { cn } from './lib/utils';
import { getSmartGesture } from './services/gemini';

type AppState = 'landing' | 'onboarding' | 'call';

export default function App() {
  const [state, setState] = useState<AppState>('landing');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [gesture, setGesture] = useState('neutral');
  const [emotion, setEmotion] = useState('happy');
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Audio analysis
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (state === 'call' && isMicOn) {
      startAudioAnalysis();
    } else {
      stopAudioAnalysis();
    }
    return () => stopAudioAnalysis();
  }, [state, isMicOn]);

  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setAudioLevel(average / 128); // Normalize to 0-1
        requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopAudioAnalysis = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) return;

    setIsProcessing(true);
    try {
      const result = await getSmartGesture(transcript);
      setGesture(result.gesture || 'neutral');
      setEmotion(result.emotion || 'happy');
      
      // Reset gesture after 3 seconds
      setTimeout(() => {
        setGesture('neutral');
      }, 3000);
    } catch (err) {
      console.error("Error getting gesture:", err);
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-sans selection:bg-indigo-500/30">
      <AnimatePresence mode="wait">
        {state === 'landing' && (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-4"
              >
                <Sparkles className="w-4 h-4" />
                <span>Next-Gen Video Communication</span>
              </motion.div>

              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-6xl md:text-8xl font-bold tracking-tighter text-white"
              >
                VocaPersona <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">AI</span>
              </motion.h1>

              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
              >
                Be anyone, anywhere. Create a realistic AI avatar that mirrors your speech, 
                gestures, and personality in real-time video calls.
              </motion.p>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-4 pt-8"
              >
                <button 
                  onClick={() => setState('onboarding')}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 group"
                >
                  Create Your Persona
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all border border-slate-700">
                  View Demo
                </button>
              </motion.div>
            </div>

            {/* Feature Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-6xl w-full"
            >
              {[
                { icon: Video, title: "Real-time Lip Sync", desc: "Avatar mouth movements perfectly match your live voice input." },
                { icon: Hand, title: "Smart Gestures", desc: "AI detects tone and context to generate natural hand and head movements." },
                { icon: User, title: "Adaptive Learning", desc: "Your persona learns your speech patterns and behavior over time." }
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                  <feature.icon className="w-10 h-10 text-indigo-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {state === 'onboarding' && (
          <motion.div 
            key="onboarding"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen flex items-center justify-center p-6"
          >
            <div className="max-w-2xl w-full space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-bold text-white tracking-tight">Create Your Avatar</h2>
                <p className="text-slate-400">Upload a photo to generate your digital twin</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 rounded-3xl bg-slate-900 border-2 border-dashed border-slate-700 hover:border-indigo-500/50 transition-colors flex flex-col items-center justify-center gap-4 cursor-pointer group">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-white">Upload Photo</p>
                    <p className="text-xs text-slate-500">JPG, PNG up to 10MB</p>
                  </div>
                </div>

                <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-800/50 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-white">Take Photo</p>
                    <p className="text-xs text-slate-500">Use your webcam</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                <h3 className="font-semibold text-indigo-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-widest mb-2 block">Voice Profile</label>
                    <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-indigo-500">
                      <option>Natural - Professional</option>
                      <option>Friendly - Casual</option>
                      <option>Energetic - Expressive</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-widest mb-2 block">Behavior Style</label>
                    <div className="flex gap-2">
                      {['Formal', 'Neutral', 'Dynamic'].map(style => (
                        <button key={style} className="flex-1 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm hover:bg-slate-700 transition-colors">
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setState('call')}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20"
              >
                Generate & Start Call
              </button>
            </div>
          </motion.div>
        )}

        {state === 'call' && (
          <motion.div 
            key="call"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen flex flex-col bg-[#050506]"
          >
            {/* Header */}
            <div className="p-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-md border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white">
                  VP
                </div>
                <div>
                  <h1 className="font-bold text-white text-sm">Design Review Sync</h1>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live Session • 04:22
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
                <div className="h-6 w-px bg-slate-800 mx-2" />
                <button 
                  onClick={() => setState('landing')}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <PhoneOff className="w-4 h-4" />
                  Leave
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar Controls */}
              <div className="w-16 bg-slate-900/30 border-r border-white/5 flex flex-col items-center py-6 gap-6">
                <button className="p-3 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                  <User className="w-6 h-6" />
                </button>
                <button className="p-3 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors group relative">
                  <Shirt className="w-6 h-6" />
                  <div className="absolute left-full ml-4 top-0 hidden group-hover:block w-48 p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">AI Outfit Assistant</p>
                    <div className="space-y-2">
                      {['Business Suit', 'Casual Hoodie', 'Tech Minimal'].map(o => (
                        <div key={o} className="p-2 rounded-lg hover:bg-slate-800 text-xs cursor-pointer transition-colors border border-transparent hover:border-indigo-500/30">
                          {o}
                        </div>
                      ))}
                    </div>
                  </div>
                </button>
                <button className="p-3 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors group relative">
                  <ImageIcon className="w-6 h-6" />
                  <div className="absolute left-full ml-4 top-0 hidden group-hover:block w-48 p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">Backgrounds</p>
                    <div className="space-y-2">
                      {['Modern Office', 'Studio Glow', 'Blurred Home'].map(b => (
                        <div key={b} className="p-2 rounded-lg hover:bg-slate-800 text-xs cursor-pointer transition-colors border border-transparent hover:border-indigo-500/30">
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>
                </button>
                <button className="p-3 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors">
                  <Smile className="w-6 h-6" />
                </button>
              </div>

              {/* Video Grid */}
              <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                {/* Avatar View */}
                <div className="min-h-[400px] lg:h-full max-h-[600px] relative">
                  <React.Suspense fallback={<div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500">Loading Avatar...</div>}>
                    <AvatarCanvas audioLevel={audioLevel} gesture={gesture} emotion={emotion} />
                  </React.Suspense>
                  <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-xs font-medium text-white">VocaPersona (You)</span>
                  </div>
                </div>

                {/* Remote Participant (Mock) */}
                <div className="h-full max-h-[600px] bg-slate-900 rounded-2xl overflow-hidden relative border border-slate-800 group">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000" 
                    alt="Remote Participant"
                    className="w-full h-full object-cover opacity-80"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                    <span className="text-xs font-medium text-white">Alex Rivera</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/60 backdrop-blur-xl p-2 rounded-2xl border border-white/10 flex gap-2">
                      <button className="p-3 rounded-xl hover:bg-white/10 text-white transition-colors">
                        <MessageSquare className="w-5 h-5" />
                      </button>
                      <button className="p-3 rounded-xl hover:bg-white/10 text-white transition-colors">
                        <Monitor className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="p-6 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 flex flex-col items-center gap-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={cn(
                    "p-4 rounded-2xl transition-all flex items-center gap-3 font-semibold",
                    isMicOn ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-red-500/20 text-red-500 border border-red-500/20"
                  )}
                >
                  {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                  <span className="hidden md:inline">{isMicOn ? 'Mute' : 'Unmute'}</span>
                </button>

                <button 
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={cn(
                    "p-4 rounded-2xl transition-all flex items-center gap-3 font-semibold",
                    isVideoOn ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-red-500/20 text-red-500 border border-red-500/20"
                  )}
                >
                  {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                  <span className="hidden md:inline">{isVideoOn ? 'Stop Video' : 'Start Video'}</span>
                </button>

                <div className="h-10 w-px bg-slate-800 mx-2" />

                <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-slate-800 rounded-2xl px-4 py-1 border border-slate-700 w-full max-w-md">
                  <input 
                    type="text" 
                    placeholder="Type to trigger AI gestures..." 
                    className="bg-transparent border-none outline-none text-white py-3 flex-1 text-sm"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    disabled={isProcessing}
                  />
                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="p-2 text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
