import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Search, 
  Truck, 
  PackageCheck, 
  ExternalLink, 
  Clock, 
  Trash2, 
  Check, 
  Copy,
  Sparkles,
  Inbox
} from 'lucide-react';
import { MockEmailNotification } from '../types';
import { saveStoredMockEmails } from '../utils/notificationService';

interface MockEmailHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: MockEmailNotification[];
  onSelectNotification: (notification: MockEmailNotification) => void;
  onClearHistory: () => void;
}

export const MockEmailHistoryModal: React.FC<MockEmailHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectNotification,
  onClearHistory,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Shipped' | 'Delivered'>('all');

  if (!isOpen) return null;

  const filtered = history.filter((item) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.orderNumber.toLowerCase().includes(q) ||
      item.recipientName.toLowerCase().includes(q) ||
      item.recipientEmail.toLowerCase().includes(q) ||
      item.trackingNumber.toLowerCase().includes(q);

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'Shipped' && (item.statusTrigger === 'Shipped' || item.statusTrigger === 'Dispatched')) ||
      (filterStatus === 'Delivered' && item.statusTrigger === 'Delivered');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FAF8F5] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#EAE3D8] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#1F1B18] text-[#FAF8F5] flex items-center justify-between border-b border-[#352F2B]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury text-base font-bold text-white tracking-wide">
                  Customer Email Notification Dispatches
                </h3>
                <span className="text-[10px] bg-blue-950 text-blue-300 font-mono px-2 py-0.5 rounded-full border border-blue-800">
                  {history.length} Alert{history.length === 1 ? '' : 's'} Triggered
                </span>
              </div>
              <p className="text-xs text-[#A89D91]">
                Real-time simulated email alerts sent to customer inboxes upon order updates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#A89D91] hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-3.5 bg-[#F3EFEA] border-b border-[#E6DFD5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8075]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, recipient name, email, or tracking #..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#DDD4C7] rounded-lg focus:outline-none focus:border-[#1F1B18]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-2.5 py-1.5 bg-white border border-[#DDD4C7] rounded-lg text-xs font-medium focus:outline-none"
            >
              <option value="all">All Notification Types</option>
              <option value="Shipped">Shipped / Dispatched</option>
              <option value="Delivered">Delivered</option>
            </select>

            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="px-2.5 py-1.5 text-[11px] text-rose-700 hover:text-white hover:bg-rose-700 bg-white border border-rose-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title="Clear notification dispatch logs"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* List Content */}
        <div className="overflow-y-auto p-4 space-y-2.5 flex-1 bg-[#FAF8F5]">
          {filtered.length === 0 ? (
            <div className="p-10 bg-white border border-[#EAE3D8] rounded-xl text-center text-[#736B63] space-y-2">
              <Inbox className="w-8 h-8 mx-auto text-[#B8ADA2]" />
              <p className="font-serif-luxury text-base text-[#1A1817]">No Notification Logs Found</p>
              <p className="text-xs text-[#8C8075] max-w-sm mx-auto">
                Update an order's status to <strong>'Shipped'</strong> or <strong>'Delivered'</strong> in the Orders table to trigger automatic mock customer email dispatches.
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const isShipped = item.statusTrigger === 'Shipped' || item.statusTrigger === 'Dispatched';
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectNotification(item);
                  }}
                  className="bg-white border border-[#EAE3D8] hover:border-[#1F1B18] p-3.5 rounded-xl shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isShipped ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {isShipped ? <Truck className="w-4 h-4" /> : <PackageCheck className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                          {item.orderNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isShipped
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {item.statusTrigger} Alert
                        </span>
                        <span className="text-[11px] text-[#8C8075] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-xs text-[#1A1817] font-medium">
                        {item.recipientName}{' '}
                        <span className="text-[#7A7066] font-normal">&lt;{item.recipientEmail}&gt;</span>
                      </div>

                      <div className="text-[11px] text-[#8C8075] flex items-center gap-2">
                        <span>Waybill: <code className="font-mono text-gray-800">{item.trackingNumber}</code></span>
                        <span>•</span>
                        <span>{item.carrier}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F0EBE1]">
                    <span className="font-mono text-xs font-bold text-[#1A1817]">${item.total.toFixed(2)}</span>
                    <button
                      type="button"
                      className="px-2.5 py-1 bg-[#1F1B18] hover:bg-[#38312B] text-white text-[11px] font-medium rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Preview Email</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#FAF8F5] border-t border-[#EAE3D8] flex items-center justify-between text-xs text-[#7A7066]">
          <span>Mock Email Service is active with 100% simulated delivery.</span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 font-semibold text-[#1A1817] hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
