'use client';

import { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';

import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import {
  addToWatchlist,
  removeFromWatchlist,
} from '@/lib/actions/watchlist.actions';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

export const WatchlistButton = ({
  symbol,
  company,
  isInWatchlist,
  showTrashIcon = false,
  type = 'icon',
  onWatchlistChange,
}: WatchlistButtonProps) => {
  const [isAdded, setIsAdded] = useState(isInWatchlist);

  // Handle adding/removing stocks from watchlist
  const toggleWatchlist = async () => {
    const result = isAdded
      ? await removeFromWatchlist(symbol)
      : await addToWatchlist(symbol, company);

    if (result.success) {
      toast.success(isAdded ? 'Removed from Watchlist' : 'Added to Watchlist', {
        description: `${company} ${
          isAdded ? 'removed from' : 'added to'
        } your watchlist`,
      });

      // Notify parent component of watchlist change for state synchronization
      onWatchlistChange?.(symbol, !isAdded);
    }
  };

  // Debounce the toggle function to prevent rapid API calls (300ms delay)
  const debouncedToggle = useDebounce(toggleWatchlist, 300);

  // Click handler that provides optimistic UI updates
  const handleWatchlistToggle = (e: React.MouseEvent) => {
    // Prevent event bubbling and default behavior
    e.stopPropagation();
    e.preventDefault();

    setIsAdded(!isAdded);
    debouncedToggle();
  };

  return (
    <>
      {/* Render icon button variant */}
      {type === 'icon' ? (
        <Button
          onClick={handleWatchlistToggle}
          variant='ghost'
          className={cn('watchlist-icon-btn', {
            'watchlist-icon-added': isAdded,
          })}
        >
          <div
            className={cn('watchlist-icon', {
              '!bg-yellow-500/10': isAdded && !showTrashIcon,
            })}
          >
            {!showTrashIcon && (
              <Star
                className={cn('star-icon', { '!text-yellow-500': isAdded })}
                fill={isAdded ? 'currentColor' : 'none'}
              />
            )}

            {showTrashIcon && <Trash2 className='trash-icon' />}
          </div>
        </Button>
      ) : (
        /* Render button variant */
        <Button
          onClick={handleWatchlistToggle}
          variant='ghost'
          className={cn('watchlist-btn', { 'watchlist-remove': isAdded })}
        >
          {/* Dynamic button text based on current watchlist status */}
          {isAdded ? 'Remove from Watchlist' : 'Add to Watchlist'}
        </Button>
      )}
    </>
  );
};
