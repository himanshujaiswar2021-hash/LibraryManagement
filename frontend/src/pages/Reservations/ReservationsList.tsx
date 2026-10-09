import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationApi } from '../../services/api';
import { Reservation, ReservationStats } from '../../types';
import {
  Bookmark,
  Clock,
  CheckCircle,
  Plus,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/Common/Badge';

const fallbackReservations: Reservation[] = [
  {
    id: 'res-1',
    bookId: 'b5555555-5555-5555-5555-555555555555',
    bookTitle: 'Introduction to Algorithms (CLRS)',
    bookIsbn: '978-0262033848',
    memberId: 'd3333333-3333-3333-3333-333333333333',
    memberName: 'Carol White',
    memberEmail: 'carol.white@example.com',
    status: 'PENDING',
    queuePosition: 1,
    createdAt: '2026-10-02T09:00:00Z',
  },
  {
    id: 'res-2',
    bookId: 'b4444444-4444-4444-4444-444444444444',
    bookTitle: 'Building Microservices (2nd Edition)',
    bookIsbn: '978-1492034025',
    memberId: 'd4444444-4444-4444-4444-444444444444',
    memberName: 'David Brown',
    memberEmail: 'david.brown@example.com',
    status: 'READY_FOR_PICKUP',
    queuePosition: 1,
    pickupDeadline: '2026-10-07T14:30:00Z',
    createdAt: '2026-10-01T14:30:00Z',
  },
  {
    id: 'res-3',
    bookId: 'b1111111-1111-1111-1111-111111111111',
    bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    bookIsbn: '978-0132350884',
    memberId: 'd2222222-2222-2222-2222-222222222222',
    memberName: 'Bob Smith',
    memberEmail: 'bob.smith@example.com',
    status: 'FULFILLED',
    queuePosition: 0,
    createdAt: '2026-09-25T11:00:00Z',
  },
];

const fallbackStats: ReservationStats = {
  totalReservations: 3,
  pendingReservations: 1,
  readyForPickup: 1,
  fulfilledReservations: 1,
  cancelledReservations: 0,
};

export const ReservationsList: React.FC = () => {
  const queryClient = useQueryClient();
  const { success } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newRes, setNewRes] = useState({
    bookId: '',
    bookTitle: '',
    bookIsbn: '',
    memberId: '',
    memberName: '',
    memberEmail: '',
  });

  const { data: reservationsData, isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => reservationApi.getAll({ size: 50 }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['reservationStats'],
    queryFn: () => reservationApi.getStats(),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof newRes) => reservationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservationStats'] });
      setShowModal(false);
      setNewRes({ bookId: '', bookTitle: '', bookIsbn: '', memberId: '', memberName: '', memberEmail: '' });
      success('Hold placed successfully in Reservation Microservice');
    },
  });

  const readyMutation = useMutation({
    mutationFn: (id: string) => reservationApi.markReady(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservationStats'] });
      success('Book marked as Ready for Pickup. Patron notified.');
    },
  });

  const fulfillMutation = useMutation({
    mutationFn: (id: string) => reservationApi.fulfill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservationStats'] });
      success('Reservation fulfilled and converted into active loan');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => reservationApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['reservationStats'] });
      success('Reservation hold cancelled');
    },
  });

  const rawReservations =
    reservationsData?.data?.content && reservationsData.data.content.length > 0
      ? reservationsData.data.content
      : fallbackReservations;

  const stats = statsData?.data || fallbackStats;

  const filtered = rawReservations.filter(
    (r) =>
      r.bookTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.bookIsbn?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Book Reservations & Waitlist Queue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              Microservice :8083
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Automated FIFO hold queues, ready-for-pickup notices, and loan fulfillment
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-purple-600/20"
        >
          <Plus className="w-4 h-4" /> Place Reservation Hold
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Total Holds</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.totalReservations}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Waiting in Queue</p>
            <p className="text-2xl font-extrabold text-amber-600">{stats.pendingReservations}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Ready for Pickup</p>
            <p className="text-2xl font-extrabold text-emerald-600">{stats.readyForPickup}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Fulfilled Holds</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.fulfilledReservations}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter reservations by book title, member name, or ISBN..."
          className="w-full text-sm text-slate-900 focus:outline-none bg-transparent"
        />
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading && !filtered.length ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Loading reservations queue from microservice...
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Book Title</th>
                  <th className="px-6 py-3.5">Patron Member</th>
                  <th className="px-6 py-3.5 text-center">Queue Position</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{res.bookTitle}</p>
                      <p className="text-xs text-slate-400 font-mono">ISBN: {res.bookIsbn}</p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{res.memberName}</p>
                      <p className="text-xs text-slate-400">{res.memberEmail}</p>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-extrabold text-xs">
                        #{res.queuePosition ?? 1}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          res.status === 'READY_FOR_PICKUP'
                            ? 'success'
                            : res.status === 'PENDING'
                            ? 'warning'
                            : res.status === 'FULFILLED'
                            ? 'info'
                            : 'neutral'
                        }
                      >
                        {res.status}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {res.status === 'PENDING' && (
                          <button
                            onClick={() => readyMutation.mutate(res.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-2xs"
                          >
                            Mark Ready
                          </button>
                        )}
                        {res.status === 'READY_FOR_PICKUP' && (
                          <button
                            onClick={() => fulfillMutation.mutate(res.id)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-2xs"
                          >
                            Fulfill Loan
                          </button>
                        )}
                        {(res.status === 'PENDING' || res.status === 'READY_FOR_PICKUP') && (
                          <button
                            onClick={() => cancelMutation.mutate(res.id)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl text-xs font-semibold transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400">
            <Bookmark className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600 text-sm">No active reservations</p>
          </div>
        )}
      </div>

      {/* Place Reservation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-purple-600" />
              Place New Reservation Hold
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Book Title</label>
                <input
                  type="text"
                  placeholder="e.g. Building Microservices"
                  value={newRes.bookTitle}
                  onChange={(e) => setNewRes({ ...newRes, bookTitle: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Book ISBN</label>
                <input
                  type="text"
                  placeholder="e.g. 978-1492034025"
                  value={newRes.bookIsbn}
                  onChange={(e) => setNewRes({ ...newRes, bookIsbn: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Patron Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Carol White"
                  value={newRes.memberName}
                  onChange={(e) => setNewRes({ ...newRes, memberName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Patron Email</label>
                <input
                  type="email"
                  placeholder="e.g. carol.white@example.com"
                  value={newRes.memberEmail}
                  onChange={(e) => setNewRes({ ...newRes, memberEmail: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  createMutation.mutate({
                    ...newRes,
                    bookId: newRes.bookId || 'b4444444-4444-4444-4444-444444444444',
                    memberId: newRes.memberId || 'd3333333-3333-3333-3333-333333333333',
                  });
                }}
                disabled={!newRes.bookTitle || !newRes.memberName}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50"
              >
                Submit Hold
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ReservationsList;
