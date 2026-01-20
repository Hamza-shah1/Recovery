
import React, { useMemo, useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { User, UserRole, Client } from '../types';
import { db } from '../services/storage';

const CompanyDashboard: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  // Fix: Load async data in useEffect
  const [clients, setClients] = useState<Client[]>([]);
  const [salesmen, setSalesmen] = useState<User[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [allClients, allUsers] = await Promise.all([
        db.getClients(),
        db.getUsers()
      ]);
      setClients(allClients);
      setSalesmen(allUsers.filter(u => u.role === UserRole.SALESMAN));
    };
    loadData();
  }, []);
  
  const stats = useMemo(() => clients.reduce((acc, curr) => ({
    recovered: acc.recovered + curr.totalRecovered,
    pending: acc.pending + curr.totalPending
  }), { recovered: 0, pending: 0 }), [clients]);

  // Fix: Changed localization context to en-PK
  const formatCurrency = (val: number) => val.toLocaleString('en-PK', { minimumFractionDigits: 0 });

  return (
    <Layout title="Management Hub" role={UserRole.COMPANY} onLogout={onLogout}>
      <div className="space-y-6">
        <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-2xl">
          <p className="text-xs uppercase font-bold opacity-75 mb-1">Company-wide Recovery</p>
          <h2 className="text-4xl font-bold tracking-tight">Rs. {formatCurrency(stats.recovered)}</h2>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-3xl border border-white/10">
              <p className="text-[10px] uppercase font-bold opacity-60">Pending</p>
              <p className="text-lg font-bold">Rs. {formatCurrency(stats.pending)}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-3xl border border-white/10">
              <p className="text-[10px] uppercase font-bold opacity-60">Success Rate</p>
              <p className="text-lg font-bold">82%</p>
            </div>
          </div>
        </div>

        <section>
          <h4 className="text-sm font-bold text-gray-400 uppercase mb-4 px-1">Salesforce Performance</h4>
          <div className="space-y-3">
            {salesmen.map(s => {
              const sClients = clients.filter(c => c.salesmanId === s.id);
              const sRecovered = sClients.reduce((sum, c) => sum + c.totalRecovered, 0);
              return (
                <div key={s.id} className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold mr-4">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-800">{s.name}</h5>
                      <p className="text-[10px] text-gray-400">{sClients.length} Accounts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600">Rs. {formatCurrency(sRecovered)}</p>
                    <p className="text-[9px] text-gray-400 uppercase font-bold">Collected</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default CompanyDashboard;
