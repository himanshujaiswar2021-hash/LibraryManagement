import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../../services/api';
import { Pagination } from '../../components/Common/Pagination';
import { Badge } from '../../components/Common/Badge';
import { FileSpreadsheet, Search } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [username, setUsername] = useState('');
  const [eventType, setEventType] = useState('');
  const [entityType, setEntityType] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(15);

  const { data: auditData, isLoading } = useQuery({
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

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-7 h-7 text-slate-700" />
          Administrative Audit Trail
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Immutable log of administrative actions, user logins, catalog updates, and loan checkouts
        </p>
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
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={eventType}
          onChange={(e) => {
            setEventType(e.target.value);
            setPage(0);
          }}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-auto"
        >
          <option value="">All Event Types</option>
          <option value="USER_LOGIN">USER_LOGIN</option>
          <option value="USER_LOGOUT">USER_LOGOUT</option>
          <option value="USER_CREATED">USER_CREATED</option>
          <option value="BOOK_CREATED">BOOK_CREATED</option>
          <option value="BOOK_UPDATED">BOOK_UPDATED</option>
          <option value="MEMBER_REGISTERED">MEMBER_REGISTERED</option>
          <option value="LOAN_ISSUED">LOAN_ISSUED</option>
          <option value="LOAN_RETURNED">LOAN_RETURNED</option>
          <option value="LOAN_RENEWED">LOAN_RENEWED</option>
        </select>

        <select
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value);
            setPage(0);
          }}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-auto"
        >
          <option value="">All Entities</option>
          <option value="USER">USER</option>
          <option value="BOOK">BOOK</option>
          <option value="MEMBER">MEMBER</option>
          <option value="LOAN">LOAN</option>
        </select>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center text-slate-400 text-sm">
            Loading audit events...
          </div>
        ) : auditData?.data?.content && auditData.data.content.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Operator</th>
                  <th className="px-6 py-3.5">Event</th>
                  <th className="px-6 py-3.5">Entity</th>
                  <th className="px-6 py-3.5">Details</th>
                  <th className="px-6 py-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {auditData.data.content.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleString()}
                    </td>

                    <td className="px-6 py-3.5 font-sans font-semibold text-slate-900">
                      {event.username || 'SYSTEM'}
                    </td>

                    <td className="px-6 py-3.5">
                      <Badge variant="neutral" size="sm">
                        {event.eventType}
                      </Badge>
                    </td>

                    <td className="px-6 py-3.5 text-slate-700">
                      {event.entityType}
                    </td>

                    <td className="px-6 py-3.5 font-sans text-slate-700 max-w-md truncate">
                      {event.details || '-'}
                    </td>

                    <td className="px-6 py-3.5 text-slate-400 text-[11px]">
                      {event.ipAddress || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {auditData?.data && (
              <Pagination
                currentPage={auditData.data.page}
                totalPages={auditData.data.totalPages}
                totalElements={auditData.data.totalElements}
                pageSize={auditData.data.size}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 text-sm">
            No audit records found matching filters.
          </div>
        )}
      </div>
    </div>
  );
};
