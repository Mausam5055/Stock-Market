import { TradingViewWidget } from '@/components/TradingViewWidget';
import { WatchlistButton } from '@/components/WatchlistButton';
import { WatchlistItem } from '@/database/models/watchlist.model';
import { getStocksDetails } from '@/lib/actions/finnhub.actions';
import { getUserWatchlist } from '@/lib/actions/watchlist.actions';
import {
  BASELINE_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  SYMBOL_INFO_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
} from '@/lib/constants';
import { notFound } from 'next/navigation';

const StockDetails = async ({ params }: StockDetailsPageProps) => {
  const { symbol } = await params;

  const stockData = await getStocksDetails(symbol.toUpperCase());
  const watchlist = await getUserWatchlist();

  const isInWatchlist = watchlist.some(
    (item: WatchlistItem) => item.symbol === symbol.toUpperCase()
  );

  if (!stockData) notFound();

  return (
    <div className='grid stock-details-container'>
      <section className='lg:col-span-2 flex flex-col gap-6'>
        {/* Symbol Info */}
        <TradingViewWidget
          scriptUrl='https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js'
          config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
          className='custom-chart'
        />

        {/* Candle Chart */}
        <TradingViewWidget
          scriptUrl='https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
          config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
        />

        {/* Baseline Chart */}
        <TradingViewWidget
          scriptUrl='https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
          config={BASELINE_WIDGET_CONFIG(symbol)}
        />
      </section>
      <section className='lg:col-span-1 flex flex-col gap-6 w-full'>
        {/* Watchlist Button */}
        <WatchlistButton
          symbol={symbol}
          company={stockData.company}
          isInWatchlist={isInWatchlist}
          type='button'
        />

        {/* Technical Analysis */}
        <TradingViewWidget
          scriptUrl='https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js'
          config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
        />

        {/* Company Profile */}
        <TradingViewWidget
          scriptUrl='https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js'
          config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
        />

        {/* Company Financials */}
        <TradingViewWidget
          scriptUrl='https://s3.tradingview.com/external-embedding/embed-widget-financials.js'
          config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
        />
      </section>
    </div>
  );
};

export default StockDetails;
