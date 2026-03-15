import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wifi, MessageCircle } from 'lucide-react';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-50"
    >
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-text font-semibold">
          <Wifi className="w-6 h-6 text-primary" />
          Zeronet
        </Link>
        <Link
          to="/"
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">Lobby</span>
        </Link>
      </div>
    </motion.nav>
  );
}
