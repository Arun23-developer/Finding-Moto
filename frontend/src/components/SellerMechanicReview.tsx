import React, { useState, useEffect } from 'react';
import { Star, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import reviewService, { ReviewResponse, Review } from '@/services/reviewService';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SellerMechanicReviewProps {
  targetId: string;
  targetType: 'seller' | 'mechanic';
}

interface ReviewStats {
  average: number;
  total: number;
  recommended: number;
}

interface Distribution {
  stars: number;
  count: number;
  percentage: number;
}

export const SellerMechanicReview: React.FC<SellerMechanicReviewProps> = ({
  targetId,
  targetType,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ average: 0, total: 0, recommended: 0 });
  const [distribution, setDistribution] = useState<Distribution[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [targetId, targetType]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      let response: ReviewResponse;
      
      if (targetType === 'seller') {
        response = await reviewService.getSellerReviews(targetId);
      } else {
        response = await reviewService.getMechanicReviews(targetId);
      }
      
      if (response.success && response.data) {
        setStats(response.data.stats);
        setDistribution(response.data.distribution);
        setReviews(response.data.reviews);
      }
    } catch (err: any) {
      setError('Failed to load reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'buyer') {
      setError('Only buyers can submit reviews');
      return;
    }

    if (!rating || !comment.trim()) {
      setError('Please provide both rating and comment');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      if (targetType === 'seller') {
        await reviewService.addSellerReview(targetId, {
          rating,
          comment: comment.trim(),
        });
      } else {
        await reviewService.addMechanicReview(targetId, {
          rating,
          comment: comment.trim(),
        });
      }

      setSuccess('Your review has been posted successfully!');
      setRating(0);
      setComment('');
      setTimeout(() => {
        setSuccess('');
        fetchReviews();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review');
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ interactive = false }: { interactive?: boolean }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && setRating(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          disabled={!interactive}
          className={cn(
            'transition-colors',
            interactive && 'cursor-pointer hover:scale-110',
            !interactive && 'cursor-default'
          )}
        >
          <Star
            size={interactive ? 28 : 20}
            className={cn(
              (hoverRating || rating) >= star
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground',
              'transition-colors'
            )}
          />
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-accent mr-2" />
        <span className="text-muted-foreground">Loading reviews...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Add Review Section */}
      <div className="border rounded-lg p-6 bg-card">
        <h3 className="text-lg font-semibold mb-4">Share Your Experience</h3>
        
        {error && (
          <div className="flex gap-2 mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex gap-2 mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded text-green-700 dark:text-green-400">
            <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Rating <span className="text-destructive">*</span>
            </label>
            <StarRating interactive={true} />
            {rating > 0 && <p className="text-xs text-muted-foreground mt-1">{rating} out of 5</p>}
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Your Review <span className="text-destructive">*</span>
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Tell us about your experience with this ${targetType}...`}
              className="w-full min-h-24 p-3 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length} / 1000 characters
            </p>
          </div>

          <Button
            type="submit"
            disabled={submitting || !rating || !comment.trim()}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </form>
      </div>

      {/* Reviews Stats */}
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-foreground">{stats.average}</div>
          <div className="flex justify-center gap-1 mt-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={star <= Math.round(stats.average) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Based on {stats.total} {stats.total === 1 ? 'review' : 'reviews'}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            {stats.recommended}% customers recommend this {targetType}
          </p>
        </div>

        {/* Rating Distribution */}
        {stats.total > 0 && (
          <div className="space-y-2 mt-6">
            <h4 className="text-sm font-medium">Rating Distribution</h4>
            {distribution.map((dist) => (
              <div key={dist.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium">{dist.stars}</span>
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${dist.percentage}%` }}
                  />
                </div>
                <div className="text-sm text-muted-foreground w-12 text-right">
                  {dist.count}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Customer Reviews ({reviews.length})</h3>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border rounded-lg p-4 bg-card/50">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">
                      {review.buyer?.firstName} {review.buyer?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={
                        star <= review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground'
                      }
                    />
                  ))}
                </div>
                <p className="text-sm text-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {reviews.length === 0 && stats.total === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No reviews yet. Be the first to share your experience!
          </p>
        </div>
      )}
    </div>
  );
};

export default SellerMechanicReview;
