'use client';

import { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { pressScale } from '@/lib/haptics';

interface RatingDialogProps {
  gigId: string;
  gigTitle: string;
  revieweeId: string;
  revieweeName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, text?: string) => Promise<void>;
}

export default function RatingDialog({
  gigId,
  gigTitle,
  revieweeId,
  revieweeName,
  isOpen,
  onClose,
  onSubmit,
}: RatingDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setSubmitting(true);
    try {
      await onSubmit(rating, reviewText.trim() || undefined);
      onClose();
      // Reset form
      setRating(0);
      setHoverRating(0);
      setReviewText('');
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-bg rounded-lg border border-border max-w-sm w-full p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-lg text-text">rate experience</h3>
          <button
            onClick={onClose}
            className="p-1 text-muted hover:text-text"
          >
            <X size={20} />
          </button>
        </div>

        {/* Gig info */}
        <div className="mb-4">
          <p className="text-sm text-text font-medium mb-1">{gigTitle}</p>
          <p className="text-xs text-muted">rate your experience with @{revieweeName}</p>
        </div>

        {/* Star rating */}
        <div className="mb-4">
          <div className="flex gap-1 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="p-1"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  size={24}
                  className={`transition-all ${
                    star <= (hoverRating || rating)
                      ? 'text-text fill-text'
                      : 'text-dim'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-xs text-muted mt-2">
              {rating === 1 ? 'poor' : 
               rating === 2 ? 'fair' : 
               rating === 3 ? 'good' : 
               rating === 4 ? 'very good' : 'excellent'}
            </p>
          )}
        </div>

        {/* Review text */}
        <div className="mb-6">
          <textarea
            className="w-full p-3 bg-surface border border-border rounded-lg text-sm text-text placeholder:text-muted resize-none"
            placeholder="share your experience (optional)..."
            rows={3}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted">optional feedback</span>
            <span className="text-xs text-muted">{reviewText.length}/500</span>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-lg border border-border text-muted font-medium text-sm hover:bg-surface transition-colors"
          >
            skip
          </button>
          <motion.button
            className="flex-1 bg-text text-bg py-3 px-4 rounded-lg font-heading font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            {...pressScale}
          >
            {submitting ? (
              'submitting...'
            ) : (
              <>
                <Send size={16} />
                submit
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}