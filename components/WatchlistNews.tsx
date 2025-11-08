import Link from 'next/link';
import { formatTimeAgo } from '@/lib/utils';

export const WatchlistNews = ({ news = [] }: WatchlistNewsProps) => {
  if (news.length === 0) {
    return (
      <section className='text-center py-8 px-4'>
        <p className='text-gray-500/50 mb-2'>No news available</p>
      </section>
    );
  }

  return (
    <ul className='watchlist-news'>
      {news.map((article: RawNewsArticle, index: number) => {
        return (
          <li key={article.id + index} className='news-item'>
            <Link
              href={article.url || '#'}
              target='_blank'
              className='flex flex-col h-full'
            >
              <span className='news-tag'>{article.related}</span>
              <div className='mb-3'>
                <h3 className='news-title'>{article.headline || 'Untitled'}</h3>
                <div className='news-meta'>
                  <span>{article.source || 'Unknown Source'}</span>
                  <span className='mx-1'>•</span>
                  {article.datetime && (
                    <span className='mx-1'>
                      {formatTimeAgo(article.datetime) || '-'}
                    </span>
                  )}
                </div>
              </div>
              <p className='news-summary'>{article.summary}</p>
              <span className='news-cta'>Read more →</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
