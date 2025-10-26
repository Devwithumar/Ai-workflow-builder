import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Trash2 } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const ContextMenu = ({ x, y, onDuplicate, onDelete, onClose }: ContextMenuProps) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{ left: x, top: y }}
        className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
        onMouseLeave={onClose}
      >
        <button
          onClick={onDuplicate}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors"
        >
          <Copy className="w-4 h-4" />
          Duplicate
        </button>
        <button
          onClick={onDelete}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-gray-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
