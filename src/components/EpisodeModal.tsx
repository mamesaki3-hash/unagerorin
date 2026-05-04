import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SpotifyIcon } from './SpotifyIcon';

interface EpisodeModalProps {
  title: string;
  date: string;
  description: string;
  audio?: string;
  tags: string[];
  onClose: () => void;
  onTagClick?: (tag: string) => void;
}

export const EpisodeModal: React.FC<EpisodeModalProps> = ({
  title, date, description, audio, tags, onClose, onTagClick,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleTagClick = (tag: string) => {
    onTagClick?.(tag);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 pb-3 shrink-0">
            <div className="min-w-0 pr-3">
              <h2 className="font-bold text-base text-[#1b1b1d] leading-snug">{title}</h2>
              <span className="text-[11px] text-outline mt-0.5 block">{date}</span>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 p-1.5 rounded-full hover:bg-gray-100 transition-colors text-outline"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto px-5 pb-5 flex flex-col gap-4">
            <p className="text-sm text-outline leading-relaxed">{description}</p>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="px-2.5 py-1 border border-outline-variant text-[11px] text-outline rounded-full bg-white hover:border-primary hover:text-primary transition-all"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <a
                href="https://open.spotify.com/show/223Rj9cjUGjcCY1CUP4ahP"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-xs font-bold flex items-center gap-1.5 px-4 py-2 rounded-full hover:opacity-90 transition-opacity active:scale-95"
                style={{ backgroundColor: '#1DB954' }}
              >
                Spotifyで聴く
                <SpotifyIcon className="w-3 h-3" />
              </a>
              {audio && (
                <a
                  href={audio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-xs font-bold flex items-center gap-1.5 bg-primary-container px-4 py-2 rounded-full hover:opacity-90 transition-opacity active:scale-95"
                >
                  Podcastで聴く
                  <Play className="w-3 h-3 fill-current" />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};
