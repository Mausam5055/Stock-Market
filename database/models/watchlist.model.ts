import { Schema, model, models, Document } from 'mongoose';

export interface WatchlistItem extends Document {
  userId: string;
  symbol: string;
  company: string;
  addedAt: Date;
  tradingViewSymbol?: string; // TradingView equivalent symbol
}

const WatchlistSchema = new Schema<WatchlistItem>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
});

// Compound index to ensure user can't add same stock twice
WatchlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });

const Watchlist = models?.Watchlist || model<WatchlistItem>('Watchlist', WatchlistSchema);

export default Watchlist;