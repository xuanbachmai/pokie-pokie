'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

// Do = C5, Re = D5 … mapped to colours for visual variety
const NOTE_COLORS: Record<string, string> = {
  Do:  '#FF6B6B',
  Re:  '#FF9F43',
  Mi:  '#FECA57',
  Fa:  '#48DBFB',
  Sol: '#1DD1A1',
  La:  '#A29BFE',
  Si:  '#FD79A8',
};

// Each reel column is 1/5 of the grid width.
// We position the bubble at (col + 0.5) / 5 * 100% from left.
function colToPercent(col: number) {
  return `${(col + 0.5) * 20}%`;
}

export function BuffaloNoteDisplay() {
  const note = useGameStore(s => s.buffaloNoteDisplay);

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 30 }}
    >
      <AnimatePresence>
        {note && (
          <motion.div
            key={note.key}
            className="absolute flex flex-col items-center"
            style={{
              left: colToPercent(note.col),
              bottom: '55%',
              transform: 'translateX(-50%)',
            }}
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: 1, y: -48, scale: 1.1 }}
            exit={{ opacity: 0, y: -80, scale: 0.8 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            {/* Musical note icon */}
            <motion.span
              style={{ fontSize: 22, lineHeight: 1 }}
              animate={{ rotate: [0, -15, 15, -10, 0] }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              🎵
            </motion.span>

            {/* Solfège label pill */}
            <motion.div
              className="mt-0.5 px-2.5 py-0.5 rounded-full font-black text-sm tracking-wide"
              style={{
                background: `${NOTE_COLORS[note.label] ?? '#FFD700'}22`,
                border: `2px solid ${NOTE_COLORS[note.label] ?? '#FFD700'}`,
                color: NOTE_COLORS[note.label] ?? '#FFD700',
                boxShadow: `0 0 12px ${NOTE_COLORS[note.label] ?? '#FFD700'}88`,
                textShadow: `0 0 8px ${NOTE_COLORS[note.label] ?? '#FFD700'}`,
              }}
              animate={{
                boxShadow: [
                  `0 0 8px ${NOTE_COLORS[note.label] ?? '#FFD700'}66`,
                  `0 0 20px ${NOTE_COLORS[note.label] ?? '#FFD700'}cc`,
                  `0 0 8px ${NOTE_COLORS[note.label] ?? '#FFD700'}66`,
                ],
              }}
              transition={{ duration: 0.5, repeat: 1 }}
            >
              {note.label}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
