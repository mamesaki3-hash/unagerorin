import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { motion } from 'motion/react';
import { EpisodeModal } from './EpisodeModal';
import { SpotifyIcon } from './SpotifyIcon';

interface EpisodeCardProps {
  id: string;
  title: string;
  date: string;
  description: string;
  audio?: string;
  spotify?: string;
  transcript: string;
  tags: string[];
  onTagClick?: (tag: string) => void;
}

export const EpisodeCard: React.FC<EpisodeCardProps> = ({ title, date, description, audio, spotify, tags, onTagClick }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const truncatedDescription = description.length > 120
    ? description.substring(0, 120) + '...'
    : description;

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        onClick={() => setModalOpen(true)}
        className="bg-white rounded-lg border border-gray-100 p-4 transition-all cursor-pointer h-full flex flex-col group"
      >
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex justify-between items-start mb-2 shrink-0">
            <h4 className="font-bold text-sm text-[#1b1b1d] group-hover:text-primary transition-colors truncate">{title}</h4>
            <span className="text-[10px] text-outline whitespace-nowrap ml-2">{date}</span>
          </div>
          <p className="text-xs text-outline mb-2 leading-snug flex-1 line-clamp-4 group-hover:text-[#1b1b1d] transition-colors">
            {truncatedDescription}
          </p>
          <div className="flex flex-col gap-3 mt-auto shrink-0 min-w-0">
            <div className="flex gap-1 flex-wrap overflow-hidden h-6 py-0.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  onClick={(e) => { e.stopPropagation(); onTagClick?.(tag); }}
                  className="px-2 py-0.5 border border-outline-variant text-[10px] text-outline rounded-full bg-white hover:border-primary hover:text-primary transition-all whitespace-nowrap shrink-0 z-10"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <a
                href={spotify ?? 'https://open.spotify.com/show/223Rj9cjUGjcCY1CUP4ahP'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="whitespace-nowrap text-white text-[10px] font-bold flex items-center gap-1 px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity active:scale-95"
                style={{ backgroundColor: '#1DB954' }}
              >
                Spotifyで聴く
                <SpotifyIcon className="w-2.5 h-2.5" />
              </a>
              {audio ? (
                <a
                  href={audio}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="whitespace-nowrap text-white text-[10px] font-bold flex items-center gap-1 bg-primary-container px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity active:scale-95"
                >
                  Podcastで聴く
                  <Play className="w-2 h-2 fill-current" />
                </a>
              ) : (
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="whitespace-nowrap text-white text-[10px] font-bold flex items-center gap-1 bg-primary-container px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity active:scale-95"
                >
                  Podcastで聴く
                  <Play className="w-2 h-2 fill-current" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {modalOpen && (
        <EpisodeModal
          title={title}
          date={date}
          description={description}
          audio={audio}
          spotify={spotify}
          tags={tags}
          onClose={() => setModalOpen(false)}
          onTagClick={onTagClick}
        />
      )}
    </>
  );
};
