'use client';

import { Clock, CheckCircle, XCircle, CreditCard, AlertCircle } from 'lucide-react';

interface PaymentStatusProps {
  status: string;
  amount?: number;
  paymentMode?: 'advance' | 'direct';
  className?: string;
}

export default function PaymentStatus({
  status,
  amount,
  paymentMode,
  className = '',
}: PaymentStatusProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'open':
        return {
          icon: <Clock size={14} className="text-muted" />,
          text: 'awaiting confirmation',
          bgColor: 'bg-surface border-border',
          textColor: 'text-muted',
        };
      case 'agreed':
        return {
          icon: <AlertCircle size={14} className="text-text" />,
          text: 'awaiting payment',
          bgColor: 'bg-elevated border-border',
          textColor: 'text-text',
        };
      case 'payment_pending':
        return {
          icon: <Clock size={14} className="text-muted" />,
          text: 'payment processing',
          bgColor: 'bg-surface border-border',
          textColor: 'text-muted',
        };
      case 'payment_done':
      case 'in_progress':
        return {
          icon: <CheckCircle size={14} className="text-text" />,
          text: 'payment completed',
          bgColor: 'bg-elevated border-border',
          textColor: 'text-text',
        };
      case 'completed':
        return {
          icon: <CheckCircle size={14} className="text-text" />,
          text: 'gig completed',
          bgColor: 'bg-elevated border-border',
          textColor: 'text-text',
        };
      case 'disputed':
        return {
          icon: <XCircle size={14} className="text-dim" />,
          text: 'disputed',
          bgColor: 'bg-surface border-border',
          textColor: 'text-dim',
        };
      default:
        return {
          icon: <Clock size={14} className="text-muted" />,
          text: status,
          bgColor: 'bg-surface border-border',
          textColor: 'text-muted',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono ${statusInfo.bgColor} ${statusInfo.textColor} ${className}`}>
      {statusInfo.icon}
      <span>{statusInfo.text}</span>
      {amount && (
        <>
          <span className="text-muted">•</span>
          <span>₹{amount.toLocaleString()}</span>
        </>
      )}
      {paymentMode && (
        <>
          <span className="text-muted">•</span>
          <CreditCard size={12} className="inline" />
          <span>{paymentMode}</span>
        </>
      )}
    </div>
  );
}