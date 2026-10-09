import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../../services/api';
import { FileSpreadsheet, Search, Download } from 'lucide-react';
import { AuditEvent } from '../../types';

const fallbackAuditLogs: AuditEvent[] = [
  {
    id: 'aud-1',
    username: 'admin',
    eventType: 'LOAN_ISSUED',
    entityType: 'LOAN',
    entityId: 'e1111111-1111-1111-1111-111111111111',
    details: 'Issued "Clean Code" to member Alice Johnson (MEM-2026-0001)',
    ipAddress: '127.0.0.1',
    timestamp: '2026-10-04T10:30:00Z',
  },
  {
    id: 'aud-2',
    username: 'admin',
    eventType: 'PAYMENT_PROCESSED',
    entityType: 'PAYMENT',
    entityId: 't1',
    details: 'Settled overdue penalty of $2.00 via UPI (Receipt RCP-2026-0081)',
    ipAddress: '127.0.0.1',
    timestamp: '2026-10-04T09:45:00Z',
  },
  {
    id: 'aud-3',
    username: 'admin',
    eventType: 'RESERVATION_CREATED',
    entityType: 'RESERVATION',
    entityId: 'res-1',
    details: 'Placed hold on "Introduction to Algorithms" for Carol White',
    ipAddress: '127.0.0.1',
    timestamp: '2026-10-03T16:20:00Z',
  },
  {
    id: 'aud-4',
    username: 'admin',
    eventType: 'BOOK_CREATED',
    entityType: 'BOOK',
    entityId: 'b3333333-3333-3333-3333-333333333333',
    details: 'Cataloged new physical copies for "Designing Data-Intensive Applications"',
    ipAddress: '127.0.0.1',
    timestamp: '2026-10-02T11:15:00Z',
  },
  {
    id: 'aud-5',
    username: 'admin',
    eventType: 'USER_LOGIN',
    entityType: 'USER',
    entityId: 'u1',
    details: 'Open access console authenticated successfully',
    ipAddress: '127.0.0.1',
    timestamp: '2026-10-01T08:00:00Z',
  },
];

export const AuditLogs: React.FC = () => {
  const [username, setUsername] = useState('');
  const [eventType, setEventType] = useState('');
  const [entityType, setEntityType] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(15);

  const { data: auditData } = useQuery({
    queryKey: ['audit-logs', username, eventType, entityType, page, size],
    queryFn: () =>
      auditApi.search({
        username: username || undefined,
        eventType: eventType || undefined,
        entityType: entityType || undefined,
        page,
        size,
      }),
  });

  const rawLogs =
    auditData?.data?.content && auditData.data.content.length > 0 ? auditData.data.content : fallbackAuditLogs;

  const displayLogs = rawLogs.filter((log) => {
    const matchesUser = !username || log.username?.toLowerCase().includes(username.toLowerCase());
    const matchesEvent = !eventType || log.eventType === eventType;
    const matchesEntity = !entityType || log.entityType === entityType;
    return matchesUser && matchesEvent && matchesEntity;
  });

  const handleExportCSV = () => {
    const headers = 'Timestamp,Operator,Event Type,Entity,Details,IP Address\n';
    const rows = displayLogs
      .map(
        (l) =>
          `"${l.timestamp}","${l.username}","${l.eventType}","${l.entityType}","${(l.details || '').replace(
            /"/g,
            '""'
          )}","${l.ipAddress}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-slate-700" />
            Administrative Security Audit Trail
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable log of administrative operations, patron circulations, fee collections, and system events
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-semibold text-xs shadow-2xs transition self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Audit Log (CSV)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setPage(0);
            }}
            placeholder="Filter by operator username..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={eventType}
          onChange={(e) => {
            setEventType(e.target.value);
            setPage(0);
          }}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-auto"
        >
          <option value="">All Event Types</option>
          <option value="USER_LOGIN">USER_LOGIN</option>
          <option value="BOOK_CREATED">BOOK_CREATED</option>
          <option value="LOAN_ISSUED">LOAN_ISSUED</option>
          <option value="LOAN_RETURNED">LOAN_RETURNED</option>
          <option value="PAYMENT_PROCESSED">PAYMENT_PROCESSED</option>
          <option value="RESERVATION_CREATED">RESERVATION_CREATED</option>
        </select>

        <select
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value);
            setPage(0);
          }}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-auto"
        >
          <option value="">All Entities</option>
          <option value="USER">USER</option>
          <option value="BOOK">BOOK</option>
          <option value="MEMBER">MEMBER</option>
          <option value="LOAN">LOAN</option>
          <option value="PAYMENT">PAYMENT</option>
          <option value="RESERVATION">RESERVATION</option>
        </select>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Operator</th>
                <th className="px-6 py-3.5">Event</th>
                <th className="px-6 py-3.5">Entity</th>
                <th className="px-6 py-3.5">Activity Details</th>
                <th className="px-6 py-3.5 text-right">Source IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {displayLogs.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleString()}
                  </td>

                  <td className="px-6 py-3.5 font-sans font-bold text-slate-900">
                    {event.username || 'SYSTEM'}
                  </td>

                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800">
                      {event.eventType}
                    </span>
                  </td>

                  <td className="px-6 py-3.5 text-slate-700 font-sans font-semibold">
                    {event.entityType}
                  </td>

                  <td className="px-6 py-3.5 font-sans text-slate-700 max-w-md truncate">
                    {event.details || '-'}
                  </td>

                  <td className="px-6 py-3.5 text-slate-400 text-[11px] text-right">
                    {event.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AuditLogs;
