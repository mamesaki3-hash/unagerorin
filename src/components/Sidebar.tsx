import React, { useState, useRef, useEffect } from 'react';
import { List, Tag, Search, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

const HISTORY_KEY = 'unagerorin_search_history';
const MAX_HISTORY = 8;

function loadHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveHistory(history: string[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export const Sidebar: React.FC<SidebarProps> = ({ activeFilter, onFilterChange, isOpen, onClose }) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>(loadHistory);
  const [showHistory, setShowHistory] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const handleFilterChange = (filter: Filter) => {
    onFilterChange(filter);
    asideRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    if (onClose) onClose();
  };

  const submitSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const newHistory = [trimmed, ...searchHistory.filter(h => h !== trimmed)].slice(0, MAX_HISTORY);
    setSearchHistory(newHistory);
    saveHistory(newHistory);
    setShowHistory(false);
    setSearchValue('');
    handleFilterChange({ type: 'search', value: trimmed });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSearch(searchValue);
  };

  const deleteHistoryItem = (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter(h => h !== item);
    setSearchHistory(newHistory);
    saveHistory(newHistory);
  };

  useEffect(() => {
    if (activeFilter.type !== 'search') {
      setSearchValue('');
    }
  }, [activeFilter]);

  // Close history dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
          <div className="relative">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline group-focus-within:text-primary transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="フリーワードで検索"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setShowHistory(true)}
                className="w-full h-9 bg-white border border-outline-variant focus:border-primary/50 rounded-lg pl-9 pr-4 text-xs outline-none transition-all placeholder:text-outline"
              />
            </form>

            {/* Search history dropdown */}
            <AnimatePresence>
              {showHistory && searchHistory.length > 0 && (
                <motion.div
                  ref={historyRef}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
                >
                  {searchHistory.map((item) => (
                    <div
                      key={item}
                      onClick={() => { setSearchValue(item); submitSearch(item); }}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer group/item"
                    >
                      <Clock className="w-3 h-3 text-outline shrink-0" />
                      <span className="text-xs text-[#1b1b1d] flex-1 truncate">{item}</span>
                      <button
                        onClick={(e) => deleteHistoryItem(item, e)}
                        className="opacity-0 group-hover/item:opacity-100 p-0.5 rounded hover:bg-gray-200 transition-all"
                      >
                        <X className="w-3 h-3 text-outline" />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="mt-1 px-1 text-[10px] text-outline leading-relaxed">「そうよ」「ニチッ」「豚」などでも検索できます。</p>
        </section>

        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <div key={item.id}>
              <motion.button
                onClick={() => handleFilterChange({ type: 'all' })}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full px-3 py-2 flex items-center gap-2.5 rounded-lg transition-all font-medium ${
                  activeFilter.type === 'all'
                    ? 'bg-[#F20089] text-white shadow-sm'
                    : 'text-[#F20089] hover:opacity-60'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-xs">{item.label}</span>
              </motion.button>

              {/* Categories listed under "All Episodes" */}
              <div className="mt-1.5 mb-2 flex flex-col gap-0.5 ml-7">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.title}
                    onClick={() => handleFilterChange({ type: 'category', value: category.title })}
                    className={`text-xs transition-all py-1 px-2 rounded-md text-left font-medium flex items-center gap-2 ${
                      activeFilter.type === 'category' && activeFilter.value === category.title
                        ? 'bg-[#F20089] text-white'
                        : 'text-[#F20089] hover:opacity-60'
                    }`}
                  >
                    <span className="text-[4px] shrink-0">●</span>
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
          {allTags.slice(0, 35).map((tag) => (
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
        {allTags.length > 35 && (
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
