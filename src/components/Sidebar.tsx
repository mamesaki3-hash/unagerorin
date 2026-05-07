import React, { useState, useRef, useEffect } from 'react';
import { List, Tag, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { CATEGORIES } from '../constants';
import { Filter } from '../App';

interface SidebarProps {
  activeFilter: Filter;
  onFilterChange: (filter: Filter) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { id: 'all', icon: List, label: '全カテゴリー' },
];

// Deduplicate episodes across categories, then count tag frequency
const uniqueEpisodes = [...new Map(
  CATEGORIES.flatMap(cat => cat.episodes).map(ep => [ep.id, ep])
).values()];

const tagFrequency = new Map<string, number>();
for (const ep of uniqueEpisodes) {
  for (const tag of ep.tags) {
    tagFrequency.set(tag, (tagFrequency.get(tag) ?? 0) + 1);
  }
}

const allTags = [...tagFrequency.entries()]
  .sort((a, b) => b[1] - a[1])
  .map(([tag]) => tag);

export const Sidebar: React.FC<SidebarProps> = ({ activeFilter, onFilterChange, isOpen, onClose }) => {
  const [searchValue, setSearchValue] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const asideRef = useRef<HTMLElement>(null);

  const handleFilterChange = (filter: Filter) => {
    onFilterChange(filter);
    asideRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    if (onClose) onClose();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      handleFilterChange({ type: 'search', value: searchValue.trim() });
    }
  };

  useEffect(() => {
    if (activeFilter.type === 'search' && activeFilter.value !== searchValue) {
      setSearchValue(activeFilter.value);
    }
  }, [activeFilter]);

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside ref={asideRef} className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-[220px] border-r border-gray-200 bg-surface-container-low flex flex-col p-4 pb-24 md:pb-4 gap-6 overflow-y-auto no-scrollbar z-40 transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:flex'
      }`}>
        <section>
          <form onSubmit={handleSearchSubmit} className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline group-focus-within:text-primary transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="フリーワードで検索"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full h-9 bg-white border border-outline-variant focus:border-primary/50 rounded-lg pl-9 pr-4 text-xs outline-none transition-all placeholder:text-outline"
            />
          </form>
        </section>

        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <div key={item.id}>
              <motion.button
                onClick={() => handleFilterChange({ type: 'all' })}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full px-3 py-2 flex items-center gap-2.5 rounded-lg transition-colors ${
                  activeFilter.type === 'all' 
                    ? 'bg-primary-container text-white font-semibold shadow-sm' 
                    : 'text-outline hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-xs">{item.label}</span>
              </motion.button>
              
              {/* Categories listed under "All Episodes" */}
              <div className="ml-7 mt-1.5 mb-2 flex flex-col gap-1 border-l-2 border-gray-100 pl-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.title}
                    onClick={() => handleFilterChange({ type: 'category', value: category.title })}
                    className={`text-[11px] transition-colors py-1 text-left ${
                      activeFilter.type === 'category' && activeFilter.value === category.title
                        ? 'text-primary font-bold'
                        : 'text-outline hover:text-primary'
                    }`}
                  >
                    {category.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

      <section>
        <div className="flex items-center gap-2 px-3 mb-3">
          <Tag className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold text-[#1b1b1d]">タグ一覧</h3>
        </div>
        <div className="flex flex-wrap gap-1.5 px-1">
          {allTags.slice(0, 50).map((tag) => (
            <button
              key={tag}
              onClick={() => onFilterChange({ type: 'tag', value: tag })}
              className={`px-2.5 py-1 border text-[10px] rounded-full transition-all cursor-pointer text-left ${
                activeFilter.type === 'tag' && activeFilter.value === tag
                  ? 'bg-primary border-primary text-white shadow-sm'
                  : 'bg-white border-outline-variant text-outline hover:border-primary hover:text-primary'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
        {allTags.length > 50 && (
          <button
            onClick={() => handleFilterChange({ type: 'tags' })}
            className={`mt-3 w-full py-2 border rounded-lg text-[11px] font-bold transition-all ${
              activeFilter.type === 'tags'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-gray-300 text-outline hover:border-primary hover:text-primary'
            }`}
          >
            タグ一覧を見る ({allTags.length})
          </button>
        )}
      </section>
    </aside>
  </>
);
};
