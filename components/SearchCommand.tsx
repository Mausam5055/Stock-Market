'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';

import { Button } from './ui/button';
import { searchStocks } from '@/lib/actions/finnhub.actions';
import { useDebounce } from '@/hooks/useDebounce';
import { WatchlistButton } from './WatchlistButton';

export const SearchCommand = ({
  renderAs = 'button',
  label = 'Add Stock',
  initialStocks,
}: SearchCommandProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] =
    useState<StockWithWatchlistStatus[]>(initialStocks);

  const isSearchMode = !!searchTerm.trim();
  const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10);

  // Cmd/Ctrl + K toggles dialog
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Run search query if user typed input, otherwise reset to initial stocks
  const handleSearch = async () => {
    if (!isSearchMode) return setStocks(initialStocks);

    setLoading(true);
    try {
      const results = await searchStocks(searchTerm.trim());
      setStocks(results);
    } catch {
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useDebounce(handleSearch, 300);
  // Trigger debounced search when search term changes
  useEffect(() => {
    debouncedSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Reset search state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setStocks(initialStocks);
    }
  }, [open, initialStocks]);

  // Close dialog and reset state after user selects a stock
  const handleSelectStock = () => {
    setOpen(false);
    setSearchTerm('');
    setStocks(initialStocks);
  };

  // Handle watchlist changes status change
  const handleWatchlistChange = async (symbol: string, isAdded: boolean) => {
    // Update current stocks
    setStocks(
      initialStocks?.map((stock) =>
        stock.symbol === symbol ? { ...stock, isInWatchlist: isAdded } : stock
      ) || []
    );
  };

  return (
    <>
      {renderAs === 'text' ? (
        <span onClick={() => setOpen(true)} className='search-text'>
          {label}
        </span>
      ) : (
        <Button onClick={() => setOpen(true)} className='search-btn'>
          {label}
        </Button>
      )}

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className='search-dialog'
      >
        <div className='search-field'>
          <CommandInput
            placeholder='Search by symbol or company name'
            value={searchTerm}
            onValueChange={setSearchTerm}
            className='search-input'
          />
          {loading && <Loader2 className='search-loader' />}
        </div>

        <CommandList className='search-list scrollbar-hide-default'>
          {loading ? (
            <div className='search-list-indicator'>Loading stocks...</div>
          ) : displayStocks?.length === 0 ? (
            <CommandEmpty className='search-list-empty'>
              {isSearchMode
                ? `No results found for "${searchTerm}"`
                : 'No stocks available'}
            </CommandEmpty>
          ) : (
            <ul>
              <div className='search-count'>
                {isSearchMode ? 'Search Results' : 'Popular Stocks'} (
                {displayStocks?.length || 0})
              </div>
              {displayStocks?.map((stock, i) => (
                <li key={stock.symbol + i} className='search-item'>
                  <Link
                    href={`/stocks/${stock.symbol}`}
                    onClick={handleSelectStock}
                    className='search-item-link'
                  >
                    <TrendingUp className='h-4 w-4 text-gray-500' />
                    <div className='flex-1'>
                      <div className='search-item-name'>{stock.name}</div>
                      <div className='text-sm text-gray-500'>
                        {stock.symbol} • {stock.exchange} • {stock.type}
                      </div>
                    </div>
                    <WatchlistButton
                      symbol={stock.symbol}
                      company={stock.name}
                      isInWatchlist={stock.isInWatchlist}
                      onWatchlistChange={handleWatchlistChange}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};
