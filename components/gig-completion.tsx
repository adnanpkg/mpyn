'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Star, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import RatingDialog from './rating-dialog';
import { pressScale, haptic } from '@/lib/haptics';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';

interface GigCompletionProps {
  gig: {
    _id: string;
    title: string;
    status: string;
    creatorId: string;
    businessId?: string;
    creatorMarkedComplete?: boolean;
    businessMarkedComplete?: boolean;
  };
  currentUserId: string;
  onStatusUpdate?: () => void;
}

export default function GigCompletion({
  gig,
  currentUserId,
  onStatusUpdate,
}: GigCompletionProps) {
  const [markingComplete, setMarkingComplete] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [reviewInfo, setReviewInfo] = useState<{
    canReview: boolean;
    revieweeId?: string;
    revieweeName?: string;
    reason?: string;
  } | null>(null);

  const isCreator = gig.creatorId === currentUserId;
  const isBusiness = gig.businessId === currentUserId;
  const isCompleted = gig.status === 'completed';
  const canMarkComplete = gig.status === 'in_progress' || gig.status === 'pending_completion';

  // Check if user has already marked complete
  const hasMarkedComplete = isCreator ? gig.creatorMarkedComplete : gig.businessMarkedComplete;
  const partnerHasMarkedComplete = isCreator ? gig.businessMarkedComplete : gig.creatorMarkedComplete;

  // Load review information when gig is completed
  useEffect(() => {
    if (isCompleted && (isCreator || isBusiness)) {
      const checkReviewStatus = async () => {
        try {
          const reviewStatus = await convex.query(api.reviews.canReviewGig, {
            gigId: gig._id as any,
            userId: currentUserId as any,
          });
          setReviewInfo(reviewStatus);
        } catch (error) {
          console.error('Failed to check review status:', error);
        }
      };
      checkReviewStatus();
    }
  }, [isCompleted, gig._id, currentUserId, isCreator, isBusiness]);

  const handleMarkComplete = async () => {
    setMarkingComplete(true);
    try {
      if (isCreator) {
        await convex.mutation(api.gigs.creatorMarkComplete, {
          gigId: gig._id as any,
          userId: currentUserId as any,
        });
      } else if (isBusiness) {
        await convex.mutation(api.gigs.businessMarkComplete, {
          gigId: gig._id as any,
          userId: currentUserId as any,
        });
      }
      haptic.heavy();
      onStatusUpdate?.();
    } catch (error: any) {
      console.error('Failed to mark complete:', error);
      haptic.error();
      alert(error.message || 'failed to mark gig complete. please try again.');
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleSubmitReview = async (rating: number, text?: string) => {
    if (!reviewInfo?.revieweeId) return;

    await convex.mutation(api.reviews.submitReview, {
      gigId: gig._id as any,
      reviewerId: currentUserId as any,
      revieweeId: reviewInfo.revieweeId as any,
      rating,
      text,
    });

    // Refresh review status
    const updatedReviewStatus = await convex.query(api.reviews.canReviewGig, {
      gigId: gig._id as any,
      userId: currentUserId as any,
    });
    setReviewInfo(updatedReviewStatus);
  };

  // Don't show completion controls if user is not a participant
  if (!isCreator && !isBusiness) return null;

  // Show completion status for completed gigs
  if (isCompleted) {
    return (
      <div className="border-t border-border pt-4 space-y-3">
        <div className="bg-elevated border border-border rounded-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-text" />
            <span className="font-heading font-bold text-sm text-text">
              gig completed *
            </span>
          </div>
          <p className="text-xs text-text">
            both parties confirmed completion. great work!
          </p>
        </div>

        {/* Rating prompt */}
        {reviewInfo?.canReview && (
          <motion.button
            className="w-full bg-text text-bg py-3 px-4 rounded-pill font-heading font-bold text-sm flex items-center justify-center gap-2"
            onClick={() => { haptic.tap(); setShowRatingDialog(true); }}
            {...pressScale}
          >
            <Star size={16} />
            rate @{reviewInfo.revieweeName}
          </motion.button>
        )}

        {reviewInfo && !reviewInfo.canReview && reviewInfo.reason === 'Already reviewed' && (
          <div className="text-center text-xs text-muted py-2">
            ✓ review submitted
          </div>
        )}

        {/* Rating Dialog */}
        {showRatingDialog && reviewInfo && (
          <RatingDialog
            gigId={gig._id}
            gigTitle={gig.title}
            revieweeId={reviewInfo.revieweeId!}
            revieweeName={reviewInfo.revieweeName!}
            isOpen={showRatingDialog}
            onClose={() => setShowRatingDialog(false)}
            onSubmit={handleSubmitReview}
          />
        )}
      </div>
    );
  }

  // Show completion controls for in-progress gigs
  if (canMarkComplete) {
    return (
      <div className="border-t border-border pt-4 space-y-3">
        {/* Status indicator */}
        {gig.status === 'pending_completion' && (
          <div className="bg-surface border border-border rounded-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-text" />
              <span className="font-heading font-bold text-sm text-text">
                pending mutual confirmation
              </span>
            </div>
            <p className="text-xs text-muted">
              {hasMarkedComplete 
                ? 'waiting for partner to confirm completion...'
                : partnerHasMarkedComplete
                ? 'partner marked complete. confirm to finalize!'
                : 'both parties must mark complete to finalize gig.'
              }
            </p>
          </div>
        )}

        {/* Mark complete button */}
        {!hasMarkedComplete && (
          <motion.button
            className="w-full bg-text text-bg py-3 px-4 rounded-pill font-heading font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            onClick={handleMarkComplete}
            disabled={markingComplete}
            {...pressScale}
          >
            {markingComplete ? (
              'marking complete...'
            ) : (
              <>
                <CheckCircle size={16} />
                mark gig complete
              </>
            )}
          </motion.button>
        )}

        {/* Already marked indicator */}
        {hasMarkedComplete && (
          <div className="bg-elevated border border-border rounded-card p-3">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-text" />
              <span className="text-sm text-text">
                ✓ you marked this gig complete
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}