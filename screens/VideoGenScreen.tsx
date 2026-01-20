
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { User } from '../types';
import { generateSummaryVideo } from '../services/gemini';

const VideoGenScreen: React.FC<{ user: User }> = ({ user }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    if (window.aistudio) {
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          // Rule: Assume success after triggering and proceed
          window.aistudio.openSelectKey();
        }
      } catch (e) {
        console.warn("AI Studio key manager unavailable", e);
      }
    }

    setLoading(true);
    setStatus('Analyzing recovery performance...');
    
    try {
      const url = await generateSummaryVideo(`Personalized summary for ${user.name}: Collection efficiency at 92%. Most recoveries from Shah Alam market.`);
      setVideoUrl(url);
    } catch (e: any) {
      if (e?.message?.includes("Requested entity was not found.") && window.aistudio) {
        window.aistudio.openSelectKey();
        setStatus('Please select a paid API key to use Veo.');
      } else {
        setStatus('Generation interrupted. Please retry.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="AI Performance Recap" showBack role={user.role}>
      <div className="space-y-6">
        <div className="bg-indigo-950 rounded-[3rem] p-10 text-white text-center shadow-2xl">
          <i className="fas fa-clapperboard text-4xl mb-6 text-indigo-400"></i>
          <h3 className="text-2xl font-black mb-3 italic">Personalized Veo Recap</h3>
          <p className="text-sm text-indigo-200 font-medium px-4 opacity-80">
            Generate a cinematic summary of your weekly recoveries and market coverage.
          </p>
        </div>

        {videoUrl ? (
          <div className="space-y-4 animate-in zoom-in">
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl bg-black aspect-video border-4 border-white">
              <video src={videoUrl} className="w-full h-full" controls autoPlay />
            </div>
            <button onClick={() => setVideoUrl('')} className="w-full py-4 bg-indigo-50 text-indigo-600 font-black rounded-2xl">Generate Another</button>
          </div>
        ) : (
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-8 bg-indigo-600 text-white font-black rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all"
          >
            {loading ? (
              <>
                <i className="fas fa-circle-notch fa-spin text-2xl mb-2"></i>
                <span className="text-[10px] tracking-widest uppercase">{status}</span>
              </>
            ) : (
              <span className="tracking-[0.2em] uppercase text-sm">Create Performance Reel</span>
            )}
          </button>
        )}
      </div>
    </Layout>
  );
};

export default VideoGenScreen;
