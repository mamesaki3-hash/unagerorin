import episodesData from './episodes.json';

function formatDate(dateStr: string): string {
  return dateStr.replace(/-/g, '.');
}

const categoryOrder = ['初心者向け', '幼馴染トーク', 'お下品回', '擬音', 'ゲスト回', '名前を言ってはいけないあの人', '流行語大賞'];

const grouped = new Map<string, typeof episodesData>(
  categoryOrder.map(title => [title, []])
);

for (const ep of episodesData) {
  const cats = (ep as { categories?: string[] }).categories
    ?? [(ep as { category?: string }).category ?? '未分類'];
  for (const cat of cats) {
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(ep);
  }
}

function mapEpisodes(eps: typeof episodesData) {
  return eps.map(ep => ({
    id: String(ep.num),
    title: ep.title,
    date: formatDate(ep.date),
    description: (ep as { description?: string }).description ?? ep.transcript.slice(0, 120),
    audio: ep.audio,
    spotify: (ep as { spotify?: string }).spotify,
    tags: (ep as { tags?: string[] }).tags ?? [],
    transcript: ep.transcript,
  }));
}

const allEpisodes = mapEpisodes(episodesData);

export const CATEGORIES = [
  ...Array.from(grouped.entries())
    .filter(([, eps]) => eps.length > 0)
    .map(([title, eps]) => {
      const episodes = mapEpisodes(eps);
      const tags = [...new Set(episodes.flatMap(ep => ep.tags))];
      return { title, tags, episodes };
    }),
  {
    title: '全エピソード',
    tags: [...new Set(allEpisodes.flatMap(ep => ep.tags))],
    episodes: allEpisodes,
  },
];
