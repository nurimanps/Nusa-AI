
import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { geminiService } from '../services/geminiService';

const ImageView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const url = await geminiService.generateImage(prompt);
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url,
        prompt,
        timestamp: Date.now(),
      };
      setImages(prev => [newImage, ...prev]);
      setPrompt('');
    } catch (err) {
      console.error(err);
      alert("Gagal membuat gambar. Coba lagi nanti.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-900/30 overflow-hidden">
      <div className="w-full md:w-80 lg:w-96 glass border-r border-white/5 p-6 flex flex-col shrink-0">
        <h3 className="text-lg font-bold mb-4 text-indigo-100">AI Studio</h3>
        <p className="text-sm text-slate-400 mb-6">Describe the image you want to create. Gemini will bring it to life.</p>
        
        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic Jakarta skyline with flying cars, cyberpunk style, hyper-realistic..."
            className="w-full h-32 glass border border-white/10 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none text-slate-100 placeholder:text-slate-600"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Generate Image
              </>
            )}
          </button>
        </div>

        <div className="mt-8">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Specs</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-xs py-2 border-b border-white/5">
              <span className="text-slate-500">Model</span>
              <span className="text-slate-300">Gemini 2.5 Flash</span>
            </div>
            <div className="flex justify-between text-xs py-2 border-b border-white/5">
              <span className="text-slate-500">Resolution</span>
              <span className="text-slate-300">1024 x 1024</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        {images.length === 0 && !isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-500 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-lg">Your generated images will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {isGenerating && (
              <div className="aspect-square glass rounded-2xl flex flex-col items-center justify-center animate-pulse border-2 border-indigo-500/20">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-indigo-400 font-medium">Imagining...</p>
              </div>
            )}
            {images.map((img) => (
              <div key={img.id} className="group relative glass rounded-2xl overflow-hidden shadow-2xl transition-all hover:scale-[1.02] border border-white/5">
                <img src={img.url} alt={img.prompt} className="w-full h-auto object-cover aspect-square" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                  <p className="text-white text-sm line-clamp-2 italic mb-4">"{img.prompt}"</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.open(img.url, '_blank')}
                      className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-xs font-bold backdrop-blur-md"
                    >
                      View Full
                    </button>
                    <a 
                      href={img.url} 
                      download={`nusa-ai-${img.id}.png`}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-xs font-bold text-center"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageView;
