'use client';
import { useTradingViewWidget } from '@/hooks/useTradingViewWidget';
import { cn } from '@/lib/utils';
import React, { memo } from 'react';

interface TradingViewWidgetProps {
  title?: string;
  scriptUrl: string;
  config: Record<string, unknown>;
  height?: number;
  className?: string;
}

const TradingViewWidgetComponent = ({
  title,
  scriptUrl,
  config,
  height = 600,
  className,
}: TradingViewWidgetProps) => {
  const containerRef = useTradingViewWidget(scriptUrl, config, height);

  return (
    <div className='w-full'>
      {title && (
        <h3 className='font-semibold text-2xl text-gray-100 mb-5'>{title}</h3>
      )}
      <div
        className={cn('tradingview-widget-container', className)}
        ref={containerRef}
      >
        <div
          className='tradingview-widget-container__widget'
          style={{ width: '100%', height }}
        />
      </div>
    </div>
  );
};

export const TradingViewWidget = memo(TradingViewWidgetComponent);
