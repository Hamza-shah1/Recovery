
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { User, UserRole, Client } from '../types';
import { db } from '../services/storage';

const SalesmanDashboard: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await db.getClients(user.id);
      setClients(data);
    };
    load();
  }, [user.id]);
  
  const stats = useMemo(() => clients.reduce((acc, curr) => ({
    recovered: acc.recovered + curr.totalRecovered,
    pending: acc.pending + curr.totalPending
  }), { recovered: 0, pending: 0 }), [clients]);

  const totalBusiness = stats.recovered + stats.pending;
  const efficiency = totalBusiness > 0 ? Math.round((stats.recovered / totalBusiness) * 100) : 0;

  return (
    <Layout title={`Hello, ${user.name.split(' ')[0]}`} role={UserRole.SALESMAN} onLogout={onLogout}>
      
      {/* M3 Primary Info Card */}
      <div className="bg-indigo-600 rounded-[28px] p-6 text-white shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-1 opacity-70">Portfolio Value</p>
          <h2 className="text-4xl font-extrabold mb-6 tracking-tighter">Rs. {totalBusiness.toLocaleString()}</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="block text-[10px] font-bold uppercase text-indigo-100 mb-1">Recovered</span>
              <span className="text-lg font-bold">Rs. {stats.recovered.toLocaleString()}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="block text-[10px] font-bold uppercase text-indigo-100 mb-1">Target Achievement</span>
              <span className="text-lg font-bold">{efficiency}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Android Shortcut Chips */}
      <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-6">
        <Chip icon="fa-store" label="Add Shop" onClick={() => navigate('/add-client')} />
        <Chip icon="fa-receipt" label="Log Recovery" onClick={() => navigate('/add-payment')} />
        <Chip icon="fa-brain" label="AI Marshall" onClick={() => navigate('/ai-assistant')} />
      </div>

      {/* Priority Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 tracking-tight">Priority Collections</h3>
          <button onClick={() => navigate('/clients')} className="text-sm font-bold text-indigo-600">View Map</button>
        </div>

        {clients.length === 0 ? (
          <div className="m3-card p-12 text-center flex flex-col items-center border-dashed border-2 border-slate-200 bg-slate-50">
            <i className="fas fa-inbox text-slate-200 text-4xl mb-4"></i>
            <p className="text-slate-400 font-bold text-sm">No clients assigned yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.slice(0, 5).map(client => (
              <button 
                key={client.id}
                onClick={() => navigate(`/ledger/${client.id}`)}
                className="w-full m3-card p-4 flex items-center group active:scale-[0.98] transition-all bg-white"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all mr-4">
                  <i className="fas fa-shop"></i>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-slate-800 leading-tight">{client.shopName}</h4>
                  <p className="text-xs text-slate-500">Balance: Rs. {client.totalPending.toLocaleString()}</p>
                </div>
                <i className="fas fa-chevron-right text-slate-300 text-xs"></i>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Native AI Floating Tooltip */}
      <div className="m3-card p-5 bg-slate-900 border-none shadow-2xl relative">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg animate-pulse">
            <i className="fas fa-robot text-sm"></i>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Marshall's Insight</p>
            <p className="text-white text-xs font-medium leading-relaxed">
              "You have 4 overdue payments in the Main Cluster. Recovery potential: 85%."
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const Chip = ({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2.5 rounded-full shadow-sm active:bg-slate-100 whitespace-nowrap transition-colors"
  >
    <i className={`fas ${icon} text-indigo-600 text-sm`}></i>
    <span className="text-xs font-bold text-slate-700">{label}</span>
  </button>
);

export default SalesmanDashboard;
