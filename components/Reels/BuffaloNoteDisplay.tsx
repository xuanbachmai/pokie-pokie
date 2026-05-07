'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

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
            {/* Buffalo note sparkle — no text label */}
            <motion.div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#FFD700',
                boxShadow: '0 0 12px #FFD70088',
              }}
              animate={{
                boxShadow: [
                  '0 0 8px #FFD70066',
                  '0 0 20px #FFD700cc',
                  '0 0 8px #FFD70066',
                ],
              }}
              transition={{ duration: 0.5, repeat: 1 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
