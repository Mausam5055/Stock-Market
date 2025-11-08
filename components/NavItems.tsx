'use client';

import { NAV_ITEMS } from '@/lib/constants';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SearchCommand } from './SearchCommand';

export const NavItems = ({
  initialStocks,
}: {
  initialStocks: StockWithWatchlistStatus[];
}) => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <ul className='nav-list'>
      {NAV_ITEMS.map((item) => {
        if (item.label === 'Search') {
          return (
            <li key='search-trigger'>
              <SearchCommand
                renderAs='text'
                label='Search'
                initialStocks={initialStocks}
              />
            </li>
          );
        }

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`hover:text-yellow-500 transition-colors ${
                isActive(item.href) ? 'text-gray-100' : ''
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
