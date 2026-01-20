
import React, { useMemo, useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { User, UserRole, Client, Payment } from '../types';
import { db } from '../services/storage';

const ClientDashboard: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  // Fix: Use state and useEffect for async database records
  const [clientProfile, setClientProfile] = useState<Client | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const allClients = await db.getClients();
      const profile = allClients.find(c => c.cnic === user.cnic || c.phone === user.phone);
      setClientProfile(profile || null);

      if (profile) {
        const allPayments = await db.getPayments(profile.id);
        setPayments(allPayments.sort((a, b) => b.createdAt - a.createdAt));
      }
    };
    loadData();
  }, [user.cnic, user.phone]);

  const formatCurrency = (val: number) => val.toLocaleString('en-PK', { minimumFractionDigits: 0 });

  return (
    <Layout title="Business Account" role={UserRole.CLIENT} onLogout={onLogout}>
      {clientProfile ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden animate-in zoom-in duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-50 mb-2">Net Payable Dues</p>
            <h3 className="text-4xl font-black mb-8">
              Rs. {formatCurrency(clientProfile.totalPending)}
            </h3>
            
            <div className="flex justify-between items-end border-t border-white/10 pt-6">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase opacity-40">Registered Identity</p>
                <p className="text-sm font-black truncate max-w-[150px]">{user.name}</p>
                <p className="text-[9px] font-mono opacity-60 tracking-widest">{user.cnic}</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/10 text-right">
                <p className="text-[8px] font-black opacity-40 uppercase mb-0.5">Shop Link</p>
                <p className="text-xs font-black">{clientProfile.shopName}</p>
              </div>
            </div>
          </div>

          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center mb-4 px-2">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Payment History</h4>
              <div className="text-[9px] font-black text-green-600 uppercase bg-green-50 px-3 py-1 rounded-full">
                {payments.length} Records
              </div>
            </div>
            
            <div className="space-y-4">
              {payments.length === 0 ? (
                <div className="bg-gray-50 rounded-[2.5rem] p-16 text-center border-4 border-dashed border-gray-100">
                  <i className="fas fa-receipt text-3xl text-gray-200 mb-4 opacity-30"></i>
                  <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest">No entries found yet</p>
                </div>
              ) : (
                payments.map(p => (
                  <div key={p.id} className="bg-white p-5 rounded-[2.5rem] border border-gray-50 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mr-4 border border-green-100">
                        <i className="fas fa-check-double text-sm"></i>
                      </div>
                      <div>
                        <h5 className="font-black text-gray-800 text-lg leading-none">Rs. {formatCurrency(p.paidAmount)}</h5>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">
                          {new Date(p.createdAt).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    {p.receiptUrl && (
                      <button 
                        onClick={() => window.open(p.receiptUrl, '_blank')} 
                        className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center active:scale-90 transition-all border border-indigo-100"
                      >
                        <i className="fas fa-file-invoice text-sm"></i>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-10 text-center animate-in fade-in">
          <div className="w-24 h-24 bg-gray-100 rounded-[2rem] flex items-center justify-center text-gray-300 mb-8">
            <i className="fas fa-link-slash text-4xl"></i>
          </div>
          <h3 className="text-xl font-black text-gray-800 mb-2">Ledger Not Linked</h3>
          <p className="text-xs text-gray-400 font-medium leading-relaxed mb-10 uppercase tracking-widest">
            Your identity ({user.cnic}) has not been linked to a shop ledger by a salesman yet. Please contact your supplier's field agent.
          </p>
          <button 
            onClick={onLogout}
            className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em]"
          >
            Logout & Sync Later
          </button>
        </div>
      )}
    </Layout>
  );
};

export default ClientDashboard;
