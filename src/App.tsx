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
  const [sortOrder, setSortOrder] = useState<'new' | 'old'>('new');

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

  const allTags = useMemo(() => {
    const uniqueEpisodes = [...new Map(
      CATEGORIES.flatMap(cat => cat.episodes).map(ep => [ep.id, ep])
    ).values()];
    const tagFrequency = new Map<string, number>();
    for (const ep of uniqueEpisodes) {
      for (const tag of ep.tags) {
        tagFrequency.set(tag, (tagFrequency.get(tag) ?? 0) + 1);
      }
    }
    return [...tagFrequency.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);
  }, []);

  const filteredData = useMemo(() => {
    if (filter.type === 'all') return CATEGORIES;
    if (filter.type === 'tags') return [];
    
    if (filter.type === 'category') {
      return CATEGORIES.filter(cat => cat.title === filter.value);
    }
    
    if (filter.type === 'tag') {
      const catMap = new Map<string, string[]>();
      for (const cat of CATEGORIES) {
        for (const ep of cat.episodes) {
          if (ep.tags.includes(filter.value)) {
            if (!catMap.has(ep.id)) catMap.set(ep.id, []);
            catMap.get(ep.id)!.push(cat.title);
          }
        }
      }
      const seen = new Set<string>();
      const deduped = CATEGORIES.flatMap(cat => cat.episodes).filter(ep => {
        if (!ep.tags.includes(filter.value) || seen.has(ep.id)) return false;
        seen.add(ep.id);
        return true;
      }).map(ep => ({ ...ep, episodeCategories: catMap.get(ep.id) ?? [] }));
      if (deduped.length === 0) return [];
      return [{ title: '', tags: [], episodes: deduped }];
    }

    if (filter.type === 'search') {
      const searchTerm = filter.value.toLowerCase();
      const matches = (ep: typeof CATEGORIES[0]['episodes'][0]) =>
        ep.title.toLowerCase().includes(searchTerm) ||
        ep.description.toLowerCase().includes(searchTerm) ||
        ep.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        ep.transcript.toLowerCase().includes(searchTerm);
      const catMap = new Map<string, string[]>();
      for (const cat of CATEGORIES) {
        for (const ep of cat.episodes) {
          if (matches(ep)) {
            if (!catMap.has(ep.id)) catMap.set(ep.id, []);
            catMap.get(ep.id)!.push(cat.title);
          }
        }
      }
      const seen = new Set<string>();
      const deduped = CATEGORIES.flatMap(cat => cat.episodes).filter(ep => {
        if (!matches(ep) || seen.has(ep.id)) return false;
        seen.add(ep.id);
        return true;
      }).map(ep => ({ ...ep, episodeCategories: catMap.get(ep.id) ?? [] }));
      if (deduped.length === 0) return [];
      return [{ title: '', tags: [], episodes: deduped }];
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
        onTitleClick={() => {
          setFilter({ type: 'all' });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
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
                    className="px-4 py-2 border border-gray-200 bg-white rounded-full text-sm text-[#1b1b1d] hover:border-primary hover:text-primary transition-all shadow-sm hover:shadow-md text-left"
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
                <section key={category.title || 'results'} id={category.title} className="flex flex-col gap-4 scroll-mt-20">
                  {filter.type !== 'tag' && filter.type !== 'search' && <div className="flex items-center border-b border-gray-200 pb-2 gap-2 min-w-0">
                    <h3 className="text-xl font-bold text-[#1b1b1d] shrink-0">
                      {category.title}
                      <span className="text-xs ml-1 font-medium opacity-60">({category.episodes.length})</span>
                    </h3>
                    <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5 flex-nowrap flex-1 min-w-0">
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
                    <select
                      value={sortOrder}
                      onChange={e => setSortOrder(e.target.value as 'new' | 'old')}
                      className="shrink-0 text-[10px] font-bold text-[#1b1b1d] border border-gray-200 rounded-full px-2.5 py-1 bg-gray-200 hover:bg-gray-300 hover:border-gray-400 transition-all cursor-pointer outline-none appearance-none pr-5 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23555%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_6px_center]"
                    >
                      <option value="new">新しい順</option>
                      <option value="old">古い順</option>
                    </select>
                  </div>}
                  <div className="flex flex-col gap-3">
                    {([...category.episodes].sort((a, b) =>
                      sortOrder === 'new' ? Number(b.id) - Number(a.id) : Number(a.id) - Number(b.id)
                    ).slice(0, filter.type === 'all' ? 3 : undefined)).map((episode) => (
                      <EpisodeCard
                        key={episode.id}
                        {...episode}
                        episodeCategories={(episode as any).episodeCategories}
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
              <span className="font-bold text-[#1b1b1d] text-xs">うなげろりん！！エピソード検索</span>
            </div>
            <div className="flex gap-6 text-[11px] font-medium">
              <span className="text-gray-300 cursor-not-allowed">お問い合わせ</span>
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
