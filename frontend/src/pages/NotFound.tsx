import React from 'react';
import { Link } from 'react-router-dom';
import { Library, BookOpen, Users, ArrowRightLeft, Bookmark, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
      <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
        <Library className="w-10 h-10" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
        Error 404
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
        Catalog Resource Not Found
      </h1>
      <p className="text-sm text-slate-500 mt-2 max-w-md">
        The book record, circulation route, or patron page you were looking for doesn't exist or has been relocated.
      </p>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-8 w-full max-w-xl text-left">
        <Link
          to="/books"
          className="p-3.5 bg-white hover:bg-emerald-50/60 rounded-2xl border border-slate-200/80 shadow-2xs transition group"
        >
          <BookOpen className="w-5 h-5 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-slate-900 block">Book Catalog</span>
          <span className="text-[10px] text-slate-400">11 Titles in Stock</span>
        </Link>

        <Link
          to="/loans"
          className="p-3.5 bg-white hover:bg-sky-50/60 rounded-2xl border border-slate-200/80 shadow-2xs transition group"
        >
          <ArrowRightLeft className="w-5 h-5 text-sky-600 mb-1.5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-slate-900 block">Active Loans</span>
          <span className="text-[10px] text-slate-400">Manage Checkouts</span>
        </Link>

        <Link
          to="/members"
          className="p-3.5 bg-white hover:bg-indigo-50/60 rounded-2xl border border-slate-200/80 shadow-2xs transition group"
        >
          <Users className="w-5 h-5 text-indigo-600 mb-1.5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-slate-900 block">Patron Members</span>
          <span className="text-[10px] text-slate-400">Directory</span>
        </Link>

        <Link
          to="/reservations"
          className="p-3.5 bg-white hover:bg-purple-50/60 rounded-2xl border border-slate-200/80 shadow-2xs transition group"
        >
          <Bookmark className="w-5 h-5 text-purple-600 mb-1.5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-slate-900 block">Holds Queue</span>
          <span className="text-[10px] text-slate-400">Microservice</span>
        </Link>
      </div>

      <Link
        to="/"
        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
      >
        <Home className="w-4 h-4" />
        Return to Dashboard Overview
      </Link>
    </div>
  );
};
export default NotFound;
