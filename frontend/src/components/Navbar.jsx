import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radio, Flag } from 'lucide-react';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-50 pt-safe-t"
      style={{
        background: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(225,6,0,0.25)',
        boxShadow: '0 2px 20px rgba(225,6,0,0.1)',
      }}
    >
      {/* Racing stripe top line */}
      <div
        className="absolute top-0 left-0 w-full h-0.5 overflow-hidden"
        style={{ background: 'linear-gradient(90deg, #e10600, #ff4d00, #e10600)' }}
      />

      <div className="max-w-4xl mx-auto pl-safe-l pr-safe-r px-4 min-h-[52px] sm:min-h-[60px] flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 py-2 -my-2 min-h-[44px] group"
          style={{ minWidth: '44px' }}
        >
          {/* F1 car icon abstract */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #e10600 0%, #a80400 100%)',
              boxShadow: '0 0 10px rgba(225,6,0,0.35)',
            }}
          >
            {/* Inline F1 car SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12C3 10.5 4 9 6 9H18C20 9 21 10.5 21 12V13C21 14 20 15 18 15H6C4 15 3 14 3 13V12Z" fill="white" opacity="0.9"/>
              <path d="M6 9L8 6H16L18 9" fill="white" opacity="0.7"/>
              <circle cx="7" cy="15.5" r="2" fill="#333"/>
              <circle cx="17" cy="15.5" r="2" fill="#333"/>
              <circle cx="7" cy="15.5" r="1" fill="#555"/>
              <circle cx="17" cy="15.5" r="1" fill="#555"/>
              <path d="M11 9V6" stroke="white" strokeWidth="1" opacity="0.5"/>
              <path d="M4 12H3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M21 12H20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <span
              className="block text-sm font-black tracking-widest uppercase leading-none transition-colors group-hover:text-red-400"
              style={{ fontFamily: 'Orbitron, monospace', color: '#f0f0f0' }}
            >
              ZERO
            </span>
            <span
              className="block text-xs font-bold tracking-[0.2em] uppercase leading-none"
              style={{ fontFamily: 'Orbitron, monospace', color: '#e10600' }}
            >
              NET
            </span>
          </div>
        </Link>

        {/* Nav items */}
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md"
            style={{
              background: 'rgba(0,210,255,0.06)',
              border: '1px solid rgba(0,210,255,0.2)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: '#00d2ff',
                boxShadow: '0 0 6px #00d2ff',
                animation: 'telemetry-blink 1.5s ease-in-out infinite',
              }}
            />
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{ fontFamily: 'Orbitron, monospace', color: '#00d2ff' }}
            >
              LIVE
            </span>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-lg transition-all duration-200"
            style={{ color: 'rgba(240,240,240,0.6)' }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#e10600';
              e.currentTarget.style.background = 'rgba(225,6,0,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(240,240,240,0.6)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Flag className="w-4 h-4 shrink-0" />
            <span
              className="hidden sm:inline text-xs font-bold tracking-widest uppercase"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              Pit Lane
            </span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
