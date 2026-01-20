
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { User, UserRole, Client, Payment } from '../types';
import { db } from '../services/storage';

const LedgerScreen: React.FC<{ user: User }> = ({ user }) => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  
  // Fix: Handle async database calls with state and useEffect
  const [client, setClient] = useState<Client | null>(null);
  const [clientPayments, setClientPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const clients = await db.getClients();
      const foundClient = clients.find(c => c.id === clientId);
      setClient(foundClient || null);

      if (foundClient) {
        const payments = await db.getPayments(clientId);
        setClientPayments(payments.sort((a, b) => b.createdAt - a.createdAt));
      }
    };
    loadData();
  }, [clientId]);

  if (!client) return <Layout title="Not Found" showBack>Client record not found.</Layout>;

  const totalTrade = client.totalPending + client.totalRecovered;
  const formatCurrency = (val: number) => val.toLocaleString('en-PK', { minimumFractionDigits: 2 });
  const formatDateTime = (ts: number) => new Date(ts).toLocaleString('en-PK', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleCollectNow = () => {
    navigate('/add-payment', { state: { preSelectedClientId: client.id } });
  };

  return (
    <Layout title={client.shopName} showBack role={user.role}>
      {/* Enhanced Material Header */}
      <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-2xl -mt-2 animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <div className="flex justify-between items-start relative z-10">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-2xl font-black tracking-tight">{client.shopName}</h3>
              <button 
                onClick={handleCollectNow}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all active:scale-90"
                title="Collect Payment Now"
              >
                <i className="fas fa-plus text-xs"></i>
              </button>
            </div>
            <p className="text-xs font-medium opacity-70 tracking-widest">{client.phone}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-1">Current Dues</p>
            <p className="text-3xl font-black">Rs. {formatCurrency(client.totalPending)}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
          <div className="bg-white/10 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
            <p className="text-[9px] uppercase font-black opacity-60 tracking-widest mb-1">Total Trade</p>
            <p className="text-lg font-black">Rs. {formatCurrency(totalTrade)}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
            <p className="text-[9px] uppercase font-black opacity-60 tracking-widest mb-1">Collected</p>
            <p className="text-lg font-black text-green-300">Rs. {formatCurrency(client.totalRecovered)}</p>
          </div>
        </div>

        <button 
          onClick={handleCollectNow}
          className="w-full mt-6 py-4 bg-white text-indigo-600 font-black rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2"
        >
          <i className="fas fa-hand-holding-dollar"></i>
          <span>Record New Recovery</span>
        </button>
      </div>

      {/* Transaction List */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center px-1">
          <i className="fas fa-history mr-2"></i> Audit Trail
        </h4>
        
        {clientPayments.length === 0 ? (
          <div className="bg-gray-50 rounded-[2rem] py-16 text-center border-4 border-dashed border-gray-100">
            <i className="fas fa-receipt text-3xl text-gray-200 mb-4"></i>
            <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No Activity Recorded</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clientPayments.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-[2rem] border border-gray-50 flex items-center relative overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className={`w-1.5 h-full absolute left-0 top-0 ${p.remainingAmount > 0 ? 'bg-orange-400' : 'bg-green-500'}`}></div>
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-indigo-600 mr-5 border border-gray-100 shadow-inner">
                  <i className={`fas ${p.paymentType === 'CHEQUE' ? 'fa-money-check' : 'fa-wallet'} text-xl`}></i>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{formatDateTime(p.createdAt)}</span>
                    <span className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${p.remainingAmount > 0 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                      {p.remainingAmount > 0 ? 'Partial' : 'Full Clear'}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <h6 className="font-black text-gray-800 text-xl leading-none">Rs. {formatCurrency(p.paidAmount)}</h6>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Recovery Received</p>
                    </div>
                    {p.receiptUrl && (
                      <button 
                        onClick={() => window.open(p.receiptUrl, '_blank')}
                        className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm hover:bg-indigo-100 transition-colors"
                      >
                        <i className="fas fa-file-invoice"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default LedgerScreen;
