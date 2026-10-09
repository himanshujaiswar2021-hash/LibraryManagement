import React from 'react';
import { Link } from 'react-router-dom';
import { Library } from 'lucide-react';

export const AppFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8 px-6 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Microservices status */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-bold text-slate-900 text-sm">LibMaster Pro</span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[10px] border border-emerald-200/50">
                v2.4.0 Microservices
              </span>
            </div>
            <p className="text-slate-500 mt-0.5">
              Enterprise Library Management System with Event-Driven Microservices Architecture
            </p>
          </div>
        </div>

        {/* Microservices Mesh Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Core API
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Notifications
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Reservations
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Payments
          </span>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-4 font-semibold text-slate-600">
          <Link to="/books" className="hover:text-emerald-600 transition">
            Books
          </Link>
          <Link to="/loans" className="hover:text-emerald-600 transition">
            Loans
          </Link>
          <Link to="/members" className="hover:text-emerald-600 transition">
            Members
          </Link>
          <Link to="/reservations" className="hover:text-emerald-600 transition">
            Reservations
          </Link>
          <Link to="/payments" className="hover:text-emerald-600 transition">
            Payments
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-[11px]">
        <p>Library Operational Hours: Monday – Saturday 8:00 AM – 9:00 PM | Sunday 10:00 AM – 6:00 PM</p>
        <p className="flex items-center gap-1">
          Open Access Devops Architecture
        </p>
      </div>
    </footer>
  );
};
