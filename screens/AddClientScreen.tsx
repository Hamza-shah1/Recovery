
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { User, Client } from '../types';
import { db } from '../services/storage';
import { verifyBusiness } from '../services/gemini';

const AddClientScreen: React.FC<{ user: User }> = ({ user }) => {
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [cnic, setCnic] = useState(''); // Added field
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [verification, setVerification] = useState<{ text: string; sources: any[] } | null>(null);
  const navigate = useNavigate();

  // Fix: Make validate function async to handle database promise
  const validate = async () => {
    const newErrors: { [key: string]: string } = {};
    const trimmedShop = shopName.trim();
    
    if (trimmedShop.length < 4) {
      newErrors.shopName = 'Shop name is too short (min 4 characters).';
    }

    const phoneRegex = /^03\d{9}$/;
    if (!phoneRegex.test(phone)) {
      newErrors.phone = 'Invalid format. Use 03XXXXXXXXX (11 digits).';
    }

    if (cnic.length !== 13) {
      newErrors.cnic = 'CNIC must be exactly 13 digits.';
    } else {
      // Fix: Await getClients() promise
      const clients = await db.getClients();
      const existing = clients.find(c => c.cnic === cnic);
      if (existing) {
        newErrors.cnic = `CNIC already linked to "${existing.shopName}".`;
      }
    }
    
    if (location.trim().length < 6) {
      newErrors.location = 'Be specific. Enter Market Name and City.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerify = async () => {
    if (!shopName || !location) {
      setErrors(prev => ({ ...prev, verification: 'Fill Shop Name and Area for AI check.' }));
      return;
    }
    setLoading(true);
    try {
      const result = await verifyBusiness(shopName, location);
      setVerification(result);
      setErrors(prev => ({ ...prev, verification: '' }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Fix: Handle async validation and use saveClient
  const handleSave = async () => {
    const isValid = await validate();
    if (!isValid) return;
    
    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      shopName: shopName.trim(),
      phone: phone.trim(),
      cnic: cnic.trim(),
      salesmanId: user.id,
      createdAt: Date.now(),
      totalPending: 0,
      totalRecovered: 0
    };
    await db.saveClient(newClient);
    navigate('/dashboard');
  };

  return (
    <Layout title="Client Enrollment" showBack>
      <div className="space-y-6">
        <div className="bg-white p-7 rounded-[2.5rem] shadow-2xl border border-gray-50 space-y-5">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 px-1 tracking-widest">Shop Name</label>
            <input 
              type="text"
              value={shopName}
              onChange={e => setShopName(e.target.value)}
              className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all ${errors.shopName ? 'border-red-400' : 'border-transparent focus:border-indigo-600'}`}
              placeholder="Haji & Sons"
            />
            {errors.shopName && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.shopName}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 px-1 tracking-widest">Owner CNIC (13 Digits)</label>
            <input 
              type="text"
              maxLength={13}
              value={cnic}
              onChange={e => setCnic(e.target.value.replace(/\D/g, ''))}
              className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all ${errors.cnic ? 'border-red-400' : 'border-transparent focus:border-indigo-600'}`}
              placeholder="42101xxxxxxxx"
            />
            {errors.cnic && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.cnic}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 px-1 tracking-widest">Contact (03xxxxxxxxx)</label>
            <input 
              type="tel"
              maxLength={11}
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all ${errors.phone ? 'border-red-400' : 'border-transparent focus:border-indigo-600'}`}
              placeholder="03001234567"
            />
            {errors.phone && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 px-1 tracking-widest">Market Location</label>
            <div className="relative">
              <input 
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all ${errors.location ? 'border-red-400' : 'border-transparent focus:border-indigo-600'}`}
                placeholder="Shah Alam, Lahore"
              />
              <button 
                onClick={handleVerify}
                disabled={loading || !shopName}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest"
              >
                {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Verify'}
              </button>
            </div>
            {errors.location && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.location}</p>}
          </div>
        </div>

        {/* Guideline: Google Search grounding results must always list the sources (URLs) */}
        {verification && (
          <div className="bg-indigo-50 p-6 rounded-[2.5rem] border border-indigo-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center space-x-2 mb-3">
              <i className="fas fa-robot text-indigo-600"></i>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Market Intelligence</span>
            </div>
            <p className="text-xs text-indigo-900 leading-relaxed mb-4">{verification.text}</p>
            {verification.sources.length > 0 && (
              <div className="space-y-2 border-t border-indigo-200 pt-3">
                <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Grounding Citations:</p>
                <div className="flex flex-wrap gap-2">
                  {verification.sources.map((source: any, idx: number) => (
                    source.web?.uri && (
                      <a 
                        key={idx}
                        href={source.web.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[8px] bg-white px-2 py-1 rounded-md border border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all truncate max-w-[150px]"
                      >
                        <i className="fas fa-link mr-1"></i>
                        {source.web.title || source.web.uri}
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <button 
          onClick={handleSave}
          className="w-full py-6 bg-indigo-600 text-white font-black rounded-[2.5rem] shadow-2xl uppercase tracking-[0.2em] flex items-center justify-center space-x-3 text-lg"
        >
          <i className="fas fa-save"></i>
          <span>Enroll Party</span>
        </button>
      </div>
    </Layout>
  );
};

export default AddClientScreen;
