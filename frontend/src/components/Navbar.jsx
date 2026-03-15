import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wifi, MessageCircle } from 'lucide-react';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 pt-safe-t"
    >
      <div className="max-w-4xl mx-auto pl-safe-l pr-safe-r px-4 min-h-[48px] sm:min-h-[56px] flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-text font-semibold text-base sm:text-lg py-2 -my-2 min-h-[44px] items-center"
          style={{ minWidth: '44px' }}
        >
          <Wifi className="w-6 h-6 text-primary shrink-0" />
          Zeronet
        </Link>
        <Link
          to="/"
          className="flex items-center gap-2 text-slate-500 active:text-primary sm:hover:text-primary transition-colors py-2 px-3 -my-2 min-h-[44px] items-center rounded-lg active:bg-slate-100"
          style={{ minWidth: '44px' }}
        >
          <MessageCircle className="w-5 h-5 shrink-0" />
          <span className="hidden sm:inline">Lobby</span>
        </Link>
      </div>
    </motion.nav>
  );
}
