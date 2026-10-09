import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Users,
  ArrowRightLeft,
  DollarSign,
  Activity,
  X,
  Clock,
  Search,
} from 'lucide-react';

interface FloatingActionHubProps {
  onOpenSearch: () => void;
}

export const FloatingActionHub: React.FC<FloatingActionHubProps> = ({ onOpenSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const microservices = [
    { name: 'Core Catalog API', port: '8080/8088', status: 'ONLINE', latency: '14ms', role: 'Catalog & Loans' },
    { name: 'Notification Service', port: '8082', status: 'ONLINE', latency: '19ms', role: 'Email / Alerts' },
    { name: 'Reservation Service', port: '8083', status: 'ONLINE', latency: '22ms', role: 'Hold Queue' },
    { name: 'Payment Service', port: '8084', status: 'ONLINE', latency: '18ms', role: 'Fine Processing' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Expanded Popup Menu */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/80 p-5 animate-scaleIn">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 leading-tight">Library Quick Hub</h3>
                <p className="text-[11px] text-slate-500">Live Services & Quick Actions</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-2.5 my-4">
            <button
              onClick={() => {
                navigate('/books');
                setIsOpen(false);
              }}
              className="p-3 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-900 rounded-2xl text-left transition flex flex-col gap-1 border border-emerald-100/50"
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold">Book Catalog</span>
              <span className="text-[10px] text-emerald-700/80">Browse all 11 books</span>
            </button>

            <button
              onClick={() => {
                navigate('/loans');
                setIsOpen(false);
              }}
              className="p-3 bg-sky-50/70 hover:bg-sky-100/70 text-sky-900 rounded-2xl text-left transition flex flex-col gap-1 border border-sky-100/50"
            >
              <ArrowRightLeft className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold">Active Loans</span>
              <span className="text-[10px] text-sky-700/80">Return & Renew</span>
            </button>

            <button
              onClick={() => {
                navigate('/members');
                setIsOpen(false);
              }}
              className="p-3 bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-900 rounded-2xl text-left transition flex flex-col gap-1 border border-indigo-100/50"
            >
              <Users className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold">Patron Directory</span>
              <span className="text-[10px] text-indigo-700/80">Manage members</span>
            </button>

            <button
              onClick={() => {
                navigate('/payments');
                setIsOpen(false);
              }}
              className="p-3 bg-amber-50/70 hover:bg-amber-100/70 text-amber-900 rounded-2xl text-left transition flex flex-col gap-1 border border-amber-100/50"
            >
              <DollarSign className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold">Fine Payments</span>
              <span className="text-[10px] text-amber-700/80">Generate receipts</span>
            </button>
          </div>

          {/* Microservices Status Mesh */}
          <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span>Microservices Mesh Status</span>
              </div>
              <span className="text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full text-[10px]">
                4/4 Online
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              {microservices.map((ms, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 px-2 rounded-lg bg-white border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-800 text-[11px]">{ms.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span>{ms.latency}</span>
                    <span className="text-emerald-600 font-bold">:{ms.port.split('/')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Search trigger & Schedule info */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSearch();
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search (Ctrl+K)</span>
            </button>

            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Open 8:00 AM - 9:00 PM</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        aria-label="Library Quick Hub"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <span className="text-xs font-bold tracking-wide">Quick Hub</span>
        <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />
      </button>
    </div>
  );
};
