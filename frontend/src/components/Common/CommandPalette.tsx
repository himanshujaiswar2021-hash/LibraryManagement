import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Users,
  ArrowRightLeft,
  ClockAlert,
  Bookmark,
  DollarSign,
  Shield,
  FileSpreadsheet,
  X,
  Command,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  title: string;
  category: 'Navigation' | 'Books' | 'Members' | 'Actions';
  description: string;
  path: string;
  icon: React.ReactNode;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const items: NavItem[] = [
    {
      title: 'Dashboard Overview',
      category: 'Navigation',
      description: 'System statistics, circulation overview, and real-time metrics',
      path: '/',
      icon: <Command className="w-4 h-4 text-emerald-600" />,
    },
    {
      title: 'Book Catalog',
      category: 'Navigation',
      description: 'Browse all available and issued books in library collection',
      path: '/books',
      icon: <BookOpen className="w-4 h-4 text-sky-600" />,
    },
    {
      title: 'Library Members',
      category: 'Navigation',
      description: 'View registered patrons, loan limits, and member accounts',
      path: '/members',
      icon: <Users className="w-4 h-4 text-indigo-600" />,
    },
    {
      title: 'Active Loans & Circulation',
      category: 'Navigation',
      description: 'Track currently checked-out materials and manage returns',
      path: '/loans',
      icon: <ArrowRightLeft className="w-4 h-4 text-amber-600" />,
    },
    {
      title: 'Overdue Loans Monitor',
      category: 'Navigation',
      description: 'Inspect overdue books, calculated penalty fines, and send alerts',
      path: '/loans/overdue',
      icon: <ClockAlert className="w-4 h-4 text-rose-600" />,
    },
    {
      title: 'Book Reservations (Microservice)',
      category: 'Navigation',
      description: 'Manage reservation hold queue and ready-for-pickup notices',
      path: '/reservations',
      icon: <Bookmark className="w-4 h-4 text-purple-600" />,
    },
    {
      title: 'Payments & Fines (Microservice)',
      category: 'Navigation',
      description: 'Collect fine dues, issue digital receipts, and approve waivers',
      path: '/payments',
      icon: <DollarSign className="w-4 h-4 text-emerald-600" />,
    },
    {
      title: 'Staff & Role Administration',
      category: 'Navigation',
      description: 'Manage librarian accounts, permissions, and security roles',
      path: '/users',
      icon: <Shield className="w-4 h-4 text-slate-600" />,
    },
    {
      title: 'Audit Trail & Compliance',
      category: 'Navigation',
      description: 'Review immutable security logs and system activity history',
      path: '/audit',
      icon: <FileSpreadsheet className="w-4 h-4 text-teal-600" />,
    },
    // Featured Books
    {
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      category: 'Books',
      description: 'Robert C. Martin - 4 of 5 copies available',
      path: '/books',
      icon: <BookOpen className="w-4 h-4 text-emerald-500" />,
    },
    {
      title: 'Designing Data-Intensive Applications',
      category: 'Books',
      description: 'Martin Kleppmann - 2 of 6 copies available',
      path: '/books',
      icon: <BookOpen className="w-4 h-4 text-emerald-500" />,
    },
    {
      title: 'Building Microservices (2nd Edition)',
      category: 'Books',
      description: 'Sam Newman - 4 copies actively issued',
      path: '/loans',
      icon: <BookOpen className="w-4 h-4 text-rose-500" />,
    },
    // Members
    {
      title: 'Alice Johnson (MEM-2026-0001)',
      category: 'Members',
      description: 'Computer Science Department - Active Loan: Clean Code',
      path: '/members',
      icon: <Users className="w-4 h-4 text-indigo-500" />,
    },
    {
      title: 'Bob Smith (MEM-2026-0002)',
      category: 'Members',
      description: 'Faculty Member - Active Loan: Designing Data-Intensive Applications',
      path: '/members',
      icon: <Users className="w-4 h-4 text-indigo-500" />,
    },
  ];

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle or open handled by parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden animate-scaleIn">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 ml-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, patrons, loans, microservices, or jump to page... (Esc to close)"
            className="w-full text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No results found for "<span className="font-semibold text-slate-600">{query}</span>"
            </div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                className="w-full text-left p-3 hover:bg-emerald-50/60 rounded-2xl transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 group-hover:bg-white rounded-xl shadow-xs transition">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800 group-hover:text-emerald-900">
                        {item.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-emerald-700 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  Jump &rarr;
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 px-4">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-slate-600">Esc</span> to close
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">LibMaster Quick Command Hub</span>
          </div>
        </div>
      </div>
    </div>
  );
};
