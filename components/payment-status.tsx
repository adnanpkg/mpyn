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
          bgColor: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-600',
        };
      case 'agreed':
        return {
          icon: <AlertCircle size={14} className="text-yellow-600" />,
          text: 'awaiting payment',
          bgColor: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-700',
        };
      case 'payment_pending':
        return {
          icon: <Clock size={14} className="text-blue-600" />,
          text: 'payment processing',
          bgColor: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-700',
        };
      case 'payment_done':
      case 'in_progress':
        return {
          icon: <CheckCircle size={14} className="text-green-600" />,
          text: 'payment completed',
          bgColor: 'bg-green-50 border-green-200',
          textColor: 'text-green-700',
        };
      case 'completed':
        return {
          icon: <CheckCircle size={14} className="text-green-600" />,
          text: 'gig completed',
          bgColor: 'bg-green-50 border-green-200',
          textColor: 'text-green-700',
        };
      case 'disputed':
        return {
          icon: <XCircle size={14} className="text-red-600" />,
          text: 'disputed',
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-700',
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