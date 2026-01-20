
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { User, PaymentType, Payment, Client } from '../types';
import { db } from '../services/storage';
import { speakConfirmation, analyzeReceipt, decodeBase64ToUint8, decodeAudioData } from '../services/gemini';

const AddPaymentScreen: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [totalBill, setTotalBill] = useState('0');
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.CASH);
  
  const [isScanning, setIsScanning] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [ocrData, setOcrData] = useState<{ merchant?: string; amount?: number; confidence?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const data = await db.getClients(user.id);
      setClients(data);
      const preId = location.state?.preSelectedClientId;
      if (preId) setSelectedClientId(preId);
    };
    loadData();
  }, [user.id, location.state]);

  const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [selectedClientId, clients]);

  const handleTriggerCamera = () => {
    setError('');
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setOcrData(null);
    setError('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setReceiptUrl(base64);
      try {
        const rawBase64 = base64.split(',')[1];
        const result = await analyzeReceipt(rawBase64);
        
        if (result && typeof result.amount === 'number') {
          setOcrData(result);
          // Logic Fix: Only overwrite if user hasn't manually typed a significant amount yet
          if (!paidAmount || paidAmount === '0' || paidAmount === '') {
            setPaidAmount(result.amount.toString());
          }
        }
      } catch (err) {
        setError('OCR could not read the parchi. Manual entry enabled.');
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const playPcmAudio = async (base64Pcm: string) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') await ctx.resume();
      
      const uint8 = decodeBase64ToUint8(base64Pcm);
      const buffer = await decodeAudioData(uint8, ctx, 24000);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  };

  const handleSave = async () => {
    if (isSubmitting || !selectedClientId) return;
    
    // UI Logic: Initialize/Resume audio context immediately on button click
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

    setIsSubmitting(true);
    setError('');

    try {
      const amt = parseFloat(paidAmount) || 0;
      const bill = parseFloat(totalBill) || 0;
      const currentPending = selectedClient?.totalPending || 0;
      const finalBal = (currentPending + bill) - amt;

      const p: Payment = {
        id: 'pay_' + Math.random().toString(36).substr(2, 9),
        clientId: selectedClientId,
        salesmanId: user.id,
        totalBill: bill,
        paidAmount: amt,
        remainingAmount: finalBal,
        paymentType,
        receiptUrl,
        createdAt: Date.now()
      };
      
      await db.recordPayment(p);
      
      // Gemini Voice Confirmation
      const speechPrompt = `Rs. ${amt} recovered from ${selectedClient?.shopName || 'Shop'}. Ledger updated successfully.`;
      const audioData = await speakConfirmation(speechPrompt);
      if (audioData) await playPcmAudio(audioData);

      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (e: any) {
      setError('System Error: Could not commit ledger entry.');
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="New Recovery" showBack role={user.role}>
      <div className="space-y-6 pb-24">
        
        {/* Account Selector */}
        <div className="m3-card p-5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Select Shop Account</label>
          <select 
            value={selectedClientId}
            onChange={e => setSelectedClientId(e.target.value)}
            className="w-full bg-slate-50 border-none px-4 py-3 rounded-2xl font-bold text-slate-800 outline-none"
          >
            <option value="">-- Search Accounts --</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.shopName}</option>)}
          </select>
        </div>

        {/* Scanner Viewfinder */}
        <div className="relative group">
          <input type="file" ref={fileInputRef} accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
          
          <div className="bg-slate-900 rounded-[32px] overflow-hidden aspect-[3/4] flex items-center justify-center relative shadow-2xl border-2 border-slate-800 transition-transform active:scale-[0.99]">
            {receiptUrl ? (
              <>
                <img src={receiptUrl} className={`w-full h-full object-cover ${isScanning ? 'opacity-40 grayscale' : 'opacity-80'}`} alt="Receipt" />
                {isScanning && <div className="scanner-line absolute w-full h-1 bg-indigo-500 shadow-[0_0_20px_#4f46e5]"></div>}
                <button onClick={() => {setReceiptUrl(''); setOcrData(null);}} className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-xl text-white rounded-full flex items-center justify-center"><i className="fas fa-times"></i></button>
              </>
            ) : (
              <button onClick={handleTriggerCamera} className="flex flex-col items-center space-y-4 text-white p-20 w-full h-full">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-3xl ripple-effect shadow-inner">
                  <i className="fas fa-camera"></i>
                </div>
                <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-60">Scan Shop Receipt</span>
              </button>
            )}
            <div className="absolute inset-8 border border-white/5 rounded-2xl pointer-events-none"></div>
          </div>

          {/* AI Detection HUD */}
          {ocrData && !isScanning && (
            <div className="absolute -bottom-6 left-6 right-6 bg-emerald-600 text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center animate-in slide-in-from-bottom-2 border border-emerald-400/30">
              <div>
                <p className="text-[8px] font-black uppercase opacity-60 tracking-widest">AI Result</p>
                <p className="text-lg font-black tracking-tight">Rs. {ocrData.amount?.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black uppercase opacity-60 tracking-widest">Merchant</p>
                <p className="text-[10px] font-bold truncate max-w-[120px]">{ocrData.merchant || 'General Store'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Manual Inputs */}
        <div className="grid grid-cols-2 gap-4 pt-8">
          <div className="m3-card p-4">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">New Invoice</span>
            <input 
              type="number" 
              value={totalBill} 
              onChange={e => setTotalBill(e.target.value)} 
              className="w-full text-lg font-bold bg-transparent outline-none text-slate-800" 
              placeholder="0.00" 
            />
          </div>
          <div className="m3-card p-4 bg-indigo-50 border-indigo-100 shadow-indigo-100/50">
            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Recovered</span>
            <input 
              type="number" 
              value={paidAmount} 
              onChange={e => setPaidAmount(e.target.value)} 
              className="w-full text-lg font-bold bg-transparent outline-none text-indigo-700" 
              placeholder="0.00" 
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase rounded-2xl border border-rose-100 flex items-center shadow-sm">
            <i className="fas fa-circle-exclamation mr-3 text-sm"></i> {error}
          </div>
        )}

        <button 
          onClick={handleSave}
          disabled={isSubmitting || !selectedClientId || isScanning}
          className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl shadow-xl uppercase tracking-[0.3em] flex items-center justify-center space-x-3 active:scale-[0.97] transition-all disabled:opacity-40"
        >
          {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-shield-check"></i>}
          <span>{isSubmitting ? 'Syncing...' : 'Record Transaction'}</span>
        </button>

      </div>
      <style>{`
        .scanner-line { animation: scan 2s ease-in-out infinite; }
        @keyframes scan { 0% { top: 15%; } 50% { top: 85%; } 100% { top: 15%; } }
      `}</style>
    </Layout>
  );
};

export default AddPaymentScreen;
