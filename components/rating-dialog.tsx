'use client';

import { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { pressScale, haptic } from '@/lib/haptics';

interface RatingDialogProps {
  gigId: string;
  gigTitle: string;
  revieweeId: string;
  revieweeName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, text?: string) => Promise<void>;
}

const springConfig = { stiffness: 400, damping: 30 };
const ratingLabels = ['poor', 'fair', 'good', 'very good', 'excellent'];

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
    haptic.tap();
    try {
      await onSubmit(rating, reviewText.trim() || undefined);
      haptic.success();
      onClose();
      setRating(0);
      setHoverRating(0);
      setReviewText('');
    } catch (error) {
      console.error('Failed to submit review:', error);
      haptic.error();
      alert('failed to submit. please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    haptic.tap();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', ...springConfig }}
        className="bg-bg border border-border rounded-[20px] w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-lg sm:text-xl text-text">
              rate experience
            </h3>
            <p className="text-xs text-muted mt-1">@{revieweeName}</p>
          </div>
          <motion.button
            onClick={handleClose}
            className="p-2 text-muted hover:text-text transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <X size={20} />
          </motion.button>
        </div>

        {/* Content */}
        <div className="px-5 sm:px-6 py-5 sm:py-6 space-y-6">
          {/* Gig info */}
          <div>
            <p className="text-sm text-text font-mono mb-1">"{gigTitle}"</p>
            <p className="text-xs text-dim">share your feedback</p>
          </div>

          {/* Star rating - Responsive */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2 sm:gap-3 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  className="p-2 cursor-pointer"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => {
                    setRating(star);
                    haptic.tap();
                  }}
                  whileTap={{ scale: 0.85 }}
                >
                  <Star
                    size={32}
                    className={`transition-all ${
                      star <= (hoverRating || rating)
                        ? 'text-text fill-text'
                        : 'text-dim'
                    }`}
                  />
                </motion.button>
              ))}
            </div>

            {/* Rating label */}
            <motion.div
              key={rating}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', ...springConfig }}
              className="text-center"
            >
              {rating > 0 && (
                <p className="text-sm font-heading font-bold text-text">
                  {ratingLabels[rating - 1]}
                </p>
              )}
            </motion.div>
          </div>

          {/* Review text - Responsive */}
          <div>
            <textarea
              className="w-full p-3 sm:p-4 bg-surface border border-border rounded-[14px] text-sm text-text placeholder:text-muted resize-none focus:border-text focus:outline-none transition-colors"
              placeholder="share your experience (optional)..."
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-dim">optional feedback</span>
              <span className="text-xs font-mono text-muted">{reviewText.length}/500</span>
            </div>
          </div>
        </div>

        {/* Actions - Responsive button layout */}
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 border-t border-border pt-4 flex gap-3 sm:gap-4">
          <button
            onClick={handleClose}
            className="flex-1 py-3 px-3 sm:px-4 rounded-full border border-border text-muted hover:bg-surface font-heading font-bold text-sm transition-colors"
          >
            skip
          </button>
          <motion.button
            className="flex-1 bg-text text-bg py-3 px-3 sm:px-4 rounded-full font-heading font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            whileTap={{ scale: 0.96 }}
            {...pressScale}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Send size={16} />
                </motion.div>
                submitting...
              </span>
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