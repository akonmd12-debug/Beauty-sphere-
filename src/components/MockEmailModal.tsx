import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  Check, 
  Copy, 
  Truck, 
  PackageCheck, 
  Sparkles, 
  MapPin, 
  Clock, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { MockEmailNotification } from '../types';

interface MockEmailModalProps {
  notification: MockEmailNotification | null;
  onClose: () => void;
  onResend?: (notification: MockEmailNotification) => void;
}

export const MockEmailModal: React.FC<MockEmailModalProps> = ({
  notification,
  onClose,
  onResend,
}) => {
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  if (!notification) return null;

  const isShipped = notification.statusTrigger === 'Shipped' || notification.statusTrigger === 'Dispatched';

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(notification.trackingNumber);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleCopyContent = () => {
    const text = `
From: Beauty Sphere Concierge <orders@beautysphere.shop>
To: ${notification.recipientName} <${notification.recipientEmail}>
Subject: ${notification.subject}
Date: ${new Date(notification.sentAt).toLocaleString()}

Status: ${notification.statusTrigger}
Tracking Number: ${notification.trackingNumber}
Carrier: ${notification.carrier}
Destination: ${notification.recipientAddress}
Order #: ${notification.orderNumber}
Total: $${notification.total.toFixed(2)}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
  };

  const handleTriggerResend = () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
      setResendSuccess(true);
      if (onResend) onResend(notification);
      setTimeout(() => setResendSuccess(false), 2500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FAF8F5] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#EAE3D8] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-[#1F1B18] text-[#FAF8F5] flex items-center justify-between border-b border-[#352F2B]">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isShipped ? 'bg-blue-600/20 text-blue-400' : 'bg-emerald-600/20 text-emerald-400'}`}>
              {isShipped ? <Truck className="w-5 h-5" /> : <PackageCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury text-base font-bold text-white tracking-wide">
                  Mock Customer Notification Trigger
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  SMTP Simulated 250 OK
                </span>
              </div>
              <p className="text-xs text-[#A89D91]">
                Customer email alert triggered on status change to <strong className="text-white font-semibold">'{notification.statusTrigger}'</strong>
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

        {/* Email Meta Info Card */}
        <div className="bg-[#F3EFEA] px-5 py-3 border-b border-[#E6DFD5] text-xs space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[#63584E]">
              <span className="font-semibold text-[#1A1817]">To:</span>
              <span className="font-mono text-[#1A1817] font-medium bg-white px-2 py-0.5 rounded border border-[#DDD5C9]">
                {notification.recipientName} &lt;{notification.recipientEmail}&gt;
              </span>
            </div>
            <div className="text-[11px] text-[#8C8075] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#8C8075]" />
              <span>{new Date(notification.sentAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[#63584E]">
            <span className="font-semibold text-[#1A1817]">Subject:</span>
            <span className="text-[#1A1817] font-medium">{notification.subject}</span>
          </div>
        </div>

        {/* Scrollable Email Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1 text-sm bg-white">
          {/* Simulated Email Template Container */}
          <div className="max-w-lg mx-auto border border-[#EAE3D8] rounded-xl overflow-hidden shadow-xs bg-[#FCFBF9]">
            {/* Boutique Brand Header */}
            <div className="bg-[#1F1B18] text-center py-6 px-4 border-b border-[#D4AF37]/30">
              <div className="flex items-center justify-center gap-1.5 text-[#D4AF37] mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs uppercase tracking-[0.25em] font-semibold">Beauty Sphere</span>
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="font-serif-luxury text-xl text-white font-medium">Royal Skincare Dispatch</h4>
              <p className="text-[11px] text-[#A89D91] mt-0.5 tracking-wider uppercase">Authentic K-Beauty & Imperial Hanbang Formulations</p>
            </div>

            {/* Email Message Content */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
                <div>
                  <p className="text-xs text-[#7A7066]">Order Reference</p>
                  <p className="font-mono font-bold text-sm text-[#1A1817]">{notification.orderNumber}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  isShipped
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  Status: {notification.statusTrigger}
                </span>
              </div>

              <div>
                <p className="font-serif-luxury text-base font-bold text-[#1A1817]">
                  Dear {notification.recipientName},
                </p>
                <p className="text-xs text-[#5C534A] leading-relaxed mt-1.5">
                  {isShipped ? (
                    <>
                      Your boutique parcel has been carefully prepared with silk-lined preservation wrapping and handed over to our courier partner. It is currently in transit to your shipping destination.
                    </>
                  ) : (
                    <>
                      Wonderful news! Your parcel has been successfully delivered to your address. We invite you to experience the nourishing benefits of your newly acquired botanical skincare ritual.
                    </>
                  )}
                </p>
              </div>

              {/* Tracking Box */}
              <div className="bg-[#F7F4EE] p-4 rounded-xl border border-[#E8DFD3] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#8C6B3E]" />
                    <span className="text-xs font-semibold text-[#1A1817]">Courier & Tracking</span>
                  </div>
                  <span className="text-[11px] text-[#7A7066] font-medium">{notification.carrier}</span>
                </div>

                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-[#DDD4C7]">
                  <div>
                    <span className="text-[10px] text-[#7A7066] block uppercase tracking-wider font-semibold">Waybill Number</span>
                    <span className="font-mono text-xs font-bold text-[#1A1817]">{notification.trackingNumber}</span>
                  </div>
                  <button
                    onClick={handleCopyTracking}
                    className="px-2 py-1 bg-[#1F1B18] hover:bg-[#38312B] text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedTracking ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTracking ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="flex items-start gap-1.5 text-[11px] text-[#63584E] pt-1 border-t border-[#EAE1D5]">
                  <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span><strong>Destination:</strong> {notification.recipientAddress}</span>
                </div>
              </div>

              {/* Order Items Preview */}
              {notification.items && notification.items.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#F0EBE1]">
                  <p className="text-xs font-semibold text-[#1A1817]">Curated Package Contents:</p>
                  <div className="space-y-1.5">
                    {notification.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 bg-white rounded border border-[#EAE3D8]">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-8 h-8 rounded object-cover border border-gray-200 shrink-0"
                          />
                          <div className="truncate">
                            <span className="font-medium text-[#1A1817] block truncate">{item.productName}</span>
                            <span className="text-[10px] text-[#8C8075]">{item.producer} • Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-gray-900 shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-xs pt-2 font-bold text-[#1A1817] border-t border-[#EAE3D8]">
                    <span>Total Order Amount:</span>
                    <span className="font-mono text-sm">${notification.total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Sign-off */}
              <div className="pt-3 border-t border-[#F0EBE1] text-[11px] text-[#7A7066] space-y-1">
                <p>Curated with precision by Beauty Sphere Concierge Service.</p>
                <p>For order inquiries or skin consultations, email us at <code className="text-[#1A1817]">support@beautysphere.shop</code>.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 bg-[#FAF8F5] border-t border-[#EAE3D8] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyContent}
              className="py-2 px-3 text-xs bg-white hover:bg-gray-100 text-[#4A423A] rounded-xl border border-[#D5CCC0] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedContent ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedContent ? 'Summary Copied' : 'Copy Email Text'}</span>
            </button>

            <button
              onClick={handleTriggerResend}
              disabled={resending}
              className="py-2 px-3 text-xs bg-[#1F1B18] hover:bg-[#38312B] text-white rounded-xl font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{resending ? 'Simulating Dispatch...' : resendSuccess ? '✓ Alert Resent!' : 'Resend Mock Alert'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="py-2 px-4 text-xs font-semibold text-[#1A1817] hover:bg-black/5 rounded-xl border border-transparent transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
