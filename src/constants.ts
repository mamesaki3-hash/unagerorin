import episodesData from './episodes.json';

function formatDate(dateStr: string): string {
  return dateStr.replace(/-/g, '.');
}

const categoryTagMap: Record<string, string[]> = {
  '初心者向け': ['初回', '初心者', 'ポッドキャスト', 'グッズ', '記念'],
  'お下品回':   ['小僧解体新書', '体操小僧', 'ビキニ', 'お下品', '問題作'],
  'ゲスト回':   ['ゲスト', '同期', '紅しょうが', '滝音', '初ゲスト'],
  '擬音':       ['日常', '孤独', '価値観', '等身大'],
  '晴美':       ['晴美', '母', '実家', '家族'],
  '流行語大賞': ['流行語', '名言', '迷言', 'まとめ'],
};

const categoryOrder = ['初心者向け', 'ゲスト回', 'お下品回', '擬音', '晴美', '流行語大賞'];

const grouped = new Map<string, typeof episodesData>(
  categoryOrder.map(title => [title, []])
);

for (const ep of episodesData) {
  const cat = (ep as { category?: string }).category ?? '未分類';
  if (!grouped.has(cat)) grouped.set(cat, []);
  grouped.get(cat)!.push(ep);
}

export const CATEGORIES = Array.from(grouped.entries())
  .filter(([, eps]) => eps.length > 0)
  .map(([title, eps]) => ({
    title,
    tags: categoryTagMap[title] ?? [],
    episodes: eps.map(ep => ({
      id: String(ep.num),
      title: ep.title,
      date: formatDate(ep.date),
      description: (ep as { description?: string }).description ?? ep.transcript.slice(0, 120),
      audio: ep.audio,
      tags: (ep as { tags?: string[] }).tags ?? [],
      transcript: ep.transcript,
    })),
  }));
