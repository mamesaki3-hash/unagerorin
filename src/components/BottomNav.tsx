import React from 'react';
import { Search, List, Tag } from 'lucide-react';
import { Filter } from '../App';

interface BottomNavProps {
  activeFilter: Filter;
  onFilterChange: (filter: Filter) => void;
  onOpenMenu: () => void;
  isMenuOpen: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeFilter, onFilterChange, onOpenMenu, isMenuOpen }) => {
  const active = isMenuOpen ? 'search' : activeFilter.type;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center py-2 z-50">
      <button
        onClick={() => onFilterChange({ type: 'all' })}
        className={`flex-1 flex flex-col items-center gap-1 ${active === 'all' ? 'text-primary' : 'text-outline-variant'}`}
      >
        <List className={`w-6 h-6 ${active === 'all' ? 'fill-primary/20' : ''}`} />
        <span className="text-[10px] font-medium">全カテゴリー</span>
      </button>

      <button
        onClick={() => onFilterChange({ type: 'tags' })}
        className={`flex-1 flex flex-col items-center gap-1 ${active === 'tags' ? 'text-primary' : 'text-outline-variant'}`}
      >
        <Tag className={`w-6 h-6 ${active === 'tags' ? 'fill-primary/20' : ''}`} />
        <span className="text-[10px] font-medium">タグ一覧</span>
      </button>

      <button
        onClick={() => {
          onOpenMenu();
          setTimeout(() => {
            const searchInput = document.querySelector('input[placeholder="フリーワードで検索"]') as HTMLInputElement;
            if (searchInput) searchInput.focus();
          }, 300);
        }}
        className={`flex-1 flex flex-col items-center gap-1 ${active === 'search' ? 'text-primary' : 'text-outline-variant'}`}
      >
        <Search className={`w-6 h-6 ${active === 'search' ? 'fill-primary/20' : ''}`} />
        <span className="text-[10px] font-medium">検索</span>
      </button>
    </nav>
  );
};
