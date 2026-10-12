import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Play, Pause, Mic, Check, CheckCheck } from 'lucide-react';

export default function VoiceMessage({ message, isOwn }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  const formattedTime = message.timestamp
    ? format(new Date(message.timestamp), 'hh:mm a')
    : '';

  const durationSec = message.duration || 5;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatAudioTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Generate simulated waveform heights
  const waveformHeights = [40, 60, 30, 80, 50, 90, 70, 40, 85, 60, 45, 95, 75, 40, 65, 50, 30, 80, 55, 40];
  const progressPercent = durationSec > 0 ? (currentTime / durationSec) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} my-1`}
    >
      <div
        className="relative max-w-[85%] sm:max-w-[70%] rounded-xl px-3 py-2.5"
        style={
          isOwn
            ? {
                background: '#005c4b',
                borderBottomRightRadius: '3px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }
            : {
                background: '#202c33',
                borderBottomLeftRadius: '3px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }
        }
      >
        {/* Hidden Audio Element */}
        {message.blobUrl || message.dataUrl ? (
          <audio
            ref={audioRef}
            src={message.blobUrl || message.dataUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            preload="metadata"
          />
        ) : null}

        <div className="flex items-center gap-3">
          {/* Play / Pause Circular Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md"
            style={{
              background: isOwn ? '#25d366' : '#00a884',
              color: '#111b21',
            }}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Waveform Visualization & Time */}
          <div className="flex-1 min-w-[150px]">
            {/* Waveform bars */}
            <div className="flex items-center gap-[3px] h-7 cursor-pointer" onClick={togglePlay}>
              {waveformHeights.map((h, i) => {
                const barPercent = (i / waveformHeights.length) * 100;
                const isPassed = barPercent <= progressPercent;
                return (
                  <div
                    key={i}
                    className="w-[3px] rounded-full transition-all duration-100"
                    style={{
                      height: `${h}%`,
                      background: isPassed
                        ? '#53bdeb'
                        : isOwn
                        ? 'rgba(255,255,255,0.4)'
                        : 'rgba(134,150,160,0.4)',
                    }}
                  />
                );
              })}
            </div>

            {/* Duration Display */}
            <div className="flex justify-between items-center text-[11px] mt-0.5">
              <span style={{ color: isOwn ? 'rgba(233,237,239,0.7)' : '#8696a0' }}>
                {isPlaying ? formatAudioTime(currentTime) : formatAudioTime(durationSec)}
              </span>
              <Mic className="w-3.5 h-3.5 text-[#53bdeb]" />
            </div>
          </div>
        </div>

        {/* Footer timestamp & checkmark */}
        <div className="flex items-center justify-end gap-1 mt-1 -mb-0.5">
          <span
            className="text-[11px]"
            style={{
              color: isOwn ? 'rgba(233, 237, 239, 0.65)' : 'rgba(134, 150, 160, 0.85)',
            }}
          >
            {formattedTime}
          </span>
          {isOwn && (
            <span className="inline-flex items-center">
              <CheckCheck className="w-3.5 h-3.5" style={{ color: '#53bdeb' }} />
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
