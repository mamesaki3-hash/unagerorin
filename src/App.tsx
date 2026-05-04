import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { EpisodeCard } from './components/EpisodeCard';
import { BottomNav } from './components/BottomNav';
import { ChevronRight, X } from 'lucide-react';
import { CATEGORIES } from './constants';

export type Filter =
  | { type: 'all' }
  | { type: 'tags' }
  | { type: 'category'; value: string }
  | { type: 'tag'; value: string }
  | { type: 'search'; value: string };

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const filter = useMemo((): Filter => {
    const type = searchParams.get('filter');
    const value = searchParams.get('value') ?? '';
    if (type === 'tags') return { type: 'tags' };
    if (type === 'category' && value) return { type: 'category', value };
    if (type === 'tag' && value) return { type: 'tag', value };
    if (type === 'search' && value) return { type: 'search', value };
    return { type: 'all' };
  }, [searchParams]);

  const setFilter = (f: Filter) => {
    if (f.type === 'all') setSearchParams({});
    else if (f.type === 'tags') setSearchParams({ filter: 'tags' });
    else setSearchParams({ filter: f.type, value: f.value });
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const allTags = useMemo(() => [...new Set(
    CATEGORIES.flatMap(cat => [...cat.tags, ...cat.episodes.flatMap(ep => ep.tags)])
  )].sort(), []);

  const filteredData = useMemo(() => {
    if (filter.type === 'all') return CATEGORIES;
    if (filter.type === 'tags') return [];
    
    if (filter.type === 'category') {
      return CATEGORIES.filter(cat => cat.title === filter.value);
    }
    
    if (filter.type === 'tag') {
      // Find categories that have at least one episode with this tag, 
      // then filter those episodes within the category
      return CATEGORIES.map(cat => ({
        ...cat,
        episodes: cat.episodes.filter(ep => ep.tags.includes(filter.value))
      })).filter(cat => cat.episodes.length > 0);
    }
    
    if (filter.type === 'search') {
      const searchTerm = filter.value.toLowerCase();
      return CATEGORIES.map(cat => ({
        ...cat,
        episodes: cat.episodes.filter(ep =>
          ep.title.toLowerCase().includes(searchTerm) ||
          ep.description.toLowerCase().includes(searchTerm) ||
          ep.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
          ep.transcript.toLowerCase().includes(searchTerm)
        )
      })).filter(cat => cat.episodes.length > 0);
    }
    
    return CATEGORIES;
  }, [filter]);

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-tertiary/10 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      
      <Header 
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        isMenuOpen={isMenuOpen}
      />
      <div className="flex pt-16">
        <Sidebar 
          activeFilter={filter} 
          onFilterChange={setFilter} 
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />
        <main className="flex-1 ml-0 md:ml-[220px] p-4 md:p-10 max-w-[1340px] mx-auto pb-24 md:pb-12 text-[#1b1b1d]">
          
          {filter.type === 'tags' && (
            <div className="w-full">
              <h2 className="text-2xl font-bold text-[#1b1b1d] mb-2">タグ一覧</h2>
              <p className="text-xs text-outline mb-8">全てのエピソードから抽出された検索用タグです</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setFilter({ type: 'tag', value: tag })}
                    className="px-4 py-2 border border-gray-200 bg-white rounded-full text-sm text-[#1b1b1d] hover:border-primary hover:text-primary transition-all shadow-sm hover:shadow-md"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filter.type !== 'all' && filter.type !== 'tags' && (
            <div className="mb-8 flex items-center gap-3">
              <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 flex items-center gap-3 shadow-sm">
                <span className="text-xs font-bold text-outline uppercase tracking-wider">
                  {filter.type === 'category' ? 'カテゴリー' : (filter.type === 'tag' ? 'タグ' : '検索結果')}:
                </span>
                <span className="text-sm font-black text-primary">
                  {filter.type === 'tag' ? `#${filter.value}` : filter.value}
                </span>
                <button 
                  onClick={() => setFilter({ type: 'all' })}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors text-outline"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={() => setFilter({ type: 'all' })}
                className="text-xs font-bold text-outline hover:text-primary transition-colors underline underline-offset-4"
              >
                フィルターを解除
              </button>
            </div>
          )}

          {filter.type !== 'tags' && (
            <div className={`grid grid-cols-1 ${filter.type === 'all' ? 'lg:grid-cols-2' : 'max-w-2xl mx-auto'} gap-x-10 gap-y-14`}>
              {filteredData.map((category) => (
                <section key={category.title} id={category.title} className="flex flex-col gap-4 scroll-mt-20">
                  <div className="flex items-center border-b border-gray-200 pb-2 min-w-0">
                    <div className="flex items-center gap-3 min-w-0 w-full">
                      <h3 className="text-xl font-bold text-[#1b1b1d] shrink-0">
                        {category.title}
                        <span className="text-xs ml-1 font-medium opacity-60">({category.episodes.length})</span>
                      </h3>
                      <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5 flex-nowrap">
                        {category.tags.map((tag) => (
                          <span
                            key={tag}
                            onClick={() => setFilter({ type: 'tag', value: tag })}
                            className="px-2 py-0.5 border border-outline-variant text-[10px] text-outline rounded-full bg-white hover:border-primary hover:text-primary transition-all cursor-pointer whitespace-nowrap shrink-0"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {(filter.type === 'all' ? category.episodes.slice(0, 3) : category.episodes).map((episode) => (
                      <EpisodeCard
                        key={episode.id}
                        {...episode}
                        onTagClick={(tag) => setFilter({ type: 'tag', value: tag })}
                      />
                    ))}
                    {filter.type === 'all' && category.episodes.length > 3 && (
                      <div className="mt-2 flex justify-center">
                        <button
                          onClick={() => setFilter({ type: 'category', value: category.title })}
                          className="w-full py-4 border border-gray-300 rounded-lg text-xs font-bold text-outline hover:bg-gray-50 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 group"
                        >
                          もっと見る
                          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              ))}

              {filteredData.length === 0 && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-outline gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <X className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="text-sm font-bold">該当するエピソードが見つかりませんでした</p>
                  <button
                    onClick={() => setFilter({ type: 'all' })}
                    className="px-6 py-2 bg-primary text-white rounded-full text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    全てのカテゴリーを表示
                  </button>
                </div>
              )}
            </div>
          )}

          <footer className="mt-20 w-full border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-outline">
            <div className="flex flex-col items-center md:items-start gap-1">
              <span className="font-bold text-primary text-base">うなげろりん検索</span>
              <p className="text-[11px]">© 2024 マユリカのうなげろりん エピソード検索</p>
            </div>
            <div className="flex gap-6 text-[11px] font-medium">
              <a href="#" className="hover:text-primary hover:underline transition-all">利用規約</a>
              <a href="#" className="hover:text-primary hover:underline transition-all">プライバシーポリシー</a>
              <a href="#" className="hover:text-primary hover:underline transition-all">お問い合わせ</a>
            </div>
          </footer>
        </main>
      </div>
      <BottomNav
        activeFilter={filter}
        onFilterChange={setFilter}
        onOpenMenu={() => setIsMenuOpen(true)}
        isMenuOpen={isMenuOpen}
      />
    </div>
  );
}
