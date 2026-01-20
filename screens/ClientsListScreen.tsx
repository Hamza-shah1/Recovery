
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { User, UserRole, Client } from '../types';
import { db } from '../services/storage';

const ClientsListScreen: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  // Fix: Load clients in useEffect
  const [allClients, setAllClients] = useState<Client[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      const data = await db.getClients(user.id);
      setAllClients(data);
    };
    fetchClients();
  }, [user.id]);
  
  const filteredClients = useMemo(() => {
    return allClients.filter(c => 
      c.shopName.toLowerCase().includes(search.toLowerCase()) || 
      c.phone.includes(search)
    ).sort((a, b) => b.totalPending - a.totalPending);
  }, [allClients, search]);

  const formatCurrency = (val: number) => val.toLocaleString('en-PK', { minimumFractionDigits: 0 });

  return (
    <Layout title="All Clients" showBack role={user.role}>
      <div className="space-y-6">
        <div className="relative group">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors"></i>
          <input 
            type="text"
            placeholder="Search Shop or Phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-3xl shadow-sm focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
          />
        </div>

        <div className="bg-indigo-600 p-6 rounded-[2rem] text-white flex justify-between items-center shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Active Accounts</p>
            <p className="text-2xl font-black">{filteredClients.length} Shops Registered</p>
          </div>
          <button 
            onClick={() => navigate('/add-client')}
            className="relative z-10 w-12 h-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-xl active:scale-90 transition-all"
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>

        <div className="space-y-4">
          {filteredClients.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100">
              <i className="fas fa-search text-4xl text-gray-200 mb-4"></i>
              <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No Matches Found</p>
            </div>
          ) : (
            filteredClients.map(client => {
              const trade = client.totalPending + client.totalRecovered;
              return (
                <button 
                  key={client.id}
                  onClick={() => navigate(`/ledger/${client.id}`)}
                  className="w-full bg-white p-6 rounded-[2.5rem] border border-gray-50 flex items-center justify-between hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] transition-all shadow-sm group"
                >
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black mr-4 text-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {client.shopName.charAt(0)}
                    </div>
                    <div className="text-left">
                      <h5 className="font-black text-gray-800 text-lg leading-tight">{client.shopName}</h5>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{client.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-lg ${client.totalPending > 0 ? 'text-red-500' : 'text-green-600'} leading-none`}>
                      Rs. {formatCurrency(client.totalPending)}
                    </p>
                    <p className="text-[9px] text-gray-300 uppercase font-black tracking-widest mt-1">Trade: Rs. {formatCurrency(trade)}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ClientsListScreen;
