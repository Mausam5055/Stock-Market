'use client';

import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ChevronDown, LogOut } from 'lucide-react';
import { NavItems } from './NavItems';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/actions/auth.actions';

export const UserDropdown = ({
  user,
  initialStocks,
}: {
  user: User;
  initialStocks: StockWithWatchlistStatus[];
}) => {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex items-center gap-3 text-gray-400 hover:text-yellow-500 hover:!bg-transparent transition-colors px-3 py-2 h-12 rounded-lg focus:ring-0 focus-visible:ring-0 bg-transparent'
        >
          <Avatar className='h-8 w-8 '>
            <AvatarFallback className='bg-yellow-500 text-yellow-900 text-sm font-bold'>
              {user.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className='hidden md:flex flex-col items-start'>
            <span className='text-base font-medium text-gray-400'>
              {user.name}
            </span>
          </div>
          <ChevronDown className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-56 bg-gray-800 border-gray-600 text-gray-400'
        align='end'
      >
        <DropdownMenuLabel className='text-gray-400'>
          <div className='flex relative items-center gap-3 py-2'>
            <Avatar className='h-10 w-10'>
              <AvatarFallback className='bg-yellow-500 text-yellow-900 text-base font-bold'>
                {user.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col'>
              <span className='text-base font-medium text-gray-400'>
                {user.name}
              </span>
              <span className='text-sm text-gray-500'>{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className='bg-gray-600' />
        <DropdownMenuItem
          onClick={handleSignOut}
          className='text-gray-100 text-md font-medium focus:bg-transparent focus:text-yellow-500 transition-colors cursor-pointer'
        >
          <LogOut className='h-4 w-4 mr-2 hidden sm:block' />
          Logout
        </DropdownMenuItem>
        <DropdownMenuSeparator className='hidden sm:blockbg-gray-600' />
        <nav className='sm:hidden'>
          <NavItems initialStocks={initialStocks} />
        </nav>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
