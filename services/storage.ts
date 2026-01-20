
import { User, Client, Payment, UserRole, ChatMessage } from '../types';

const TABLES = {
  USERS: 'db_users_v4',
  CLIENTS: 'db_clients_v4',
  PAYMENTS: 'db_payments_v4',
  CHAT: 'db_chat_v4',
  SESSIONS: 'db_auth_session_v4'
};

const normalize = {
  email: (val: string) => val.trim().toLowerCase(),
  phone: (val: string) => val.replace(/\D/g, ''),
  cnic: (val: string) => val.replace(/\D/g, '')
};

const query = <T>(table: string): T[] => {
  try {
    const data = localStorage.getItem(table);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const commit = (table: string, data: any): void => {
  localStorage.setItem(table, JSON.stringify(data));
};

export const api = {
  async login(identifier: string, pass: string): Promise<User> {
    const users = query<User>(TABLES.USERS);
    const cleanId = identifier.trim().toLowerCase();
    const numericId = identifier.replace(/\D/g, '');

    const user = users.find(u => 
      (normalize.email(u.email) === cleanId || normalize.phone(u.phone) === numericId || normalize.cnic(u.cnic) === numericId) && 
      u.password === pass
    );

    if (!user) throw new Error("Authentication failed.");
    
    commit(TABLES.SESSIONS, user);
    return user;
  },

  async register(user: User): Promise<User> {
    const users = query<User>(TABLES.USERS);
    const cleanUser = {
      ...user,
      email: normalize.email(user.email),
      phone: normalize.phone(user.phone),
      cnic: normalize.cnic(user.cnic)
    };

    if (users.some(u => u.email === cleanUser.email || u.phone === cleanUser.phone || u.cnic === cleanUser.cnic)) {
      throw new Error("Identity already registered.");
    }

    commit(TABLES.USERS, [...users, cleanUser]);
    commit(TABLES.SESSIONS, cleanUser);
    return cleanUser;
  },

  async verifyIdentity(email: string, phone: string): Promise<boolean> {
    const users = query<User>(TABLES.USERS);
    return users.some(u => normalize.email(u.email) === normalize.email(email) && normalize.phone(u.phone) === normalize.phone(phone));
  },

  async resetPassword(email: string, phone: string, newPass: string): Promise<void> {
    const users = query<User>(TABLES.USERS);
    const index = users.findIndex(u => normalize.email(u.email) === normalize.email(email) && normalize.phone(u.phone) === normalize.phone(phone));
    if (index === -1) throw new Error("Security mismatch.");

    users[index].password = newPass;
    commit(TABLES.USERS, users);
    localStorage.removeItem(TABLES.SESSIONS);
  },

  async getClients(salesmanId?: string): Promise<Client[]> {
    const clients = query<Client>(TABLES.CLIENTS);
    return salesmanId ? clients.filter(c => c.salesmanId === salesmanId) : clients;
  },

  async saveClient(client: Client): Promise<void> {
    const clients = query<Client>(TABLES.CLIENTS);
    if (clients.some(c => c.cnic === normalize.cnic(client.cnic))) {
      throw new Error("Shop already enrolled.");
    }
    commit(TABLES.CLIENTS, [...clients, client]);
  },

  async recordPayment(payment: Payment): Promise<void> {
    const payments = query<Payment>(TABLES.PAYMENTS);
    const clients = query<Client>(TABLES.CLIENTS);
    const clientIdx = clients.findIndex(c => c.id === payment.clientId);
    
    if (clientIdx !== -1) {
      // Fix: Atomic update logic for ledger balances
      clients[clientIdx].totalRecovered += payment.paidAmount;
      clients[clientIdx].totalPending = Math.max(0, (clients[clientIdx].totalPending + payment.totalBill) - payment.paidAmount);
      commit(TABLES.CLIENTS, [...clients]);
    }
    commit(TABLES.PAYMENTS, [...payments, payment]);
  },

  async getPayments(clientId: string): Promise<Payment[]> {
    return query<Payment>(TABLES.PAYMENTS).filter(p => p.clientId === clientId);
  },

  getChatHistory: (userId: string) => query<ChatMessage>(TABLES.CHAT).filter(m => m.userId === userId),
  saveChatMessage: (msg: ChatMessage) => commit(TABLES.CHAT, [...query<ChatMessage>(TABLES.CHAT), msg]),
  getAuth: () => JSON.parse(localStorage.getItem(TABLES.SESSIONS) || 'null'),
  logout: () => localStorage.removeItem(TABLES.SESSIONS),
  getUsers: async () => query<User>(TABLES.USERS),
  checkAdminExists: () => query<User>(TABLES.USERS).some(u => u.role === UserRole.COMPANY)
};

export const db = api;
