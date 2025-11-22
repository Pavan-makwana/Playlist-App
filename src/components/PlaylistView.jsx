import React from 'react';
import SongItem from './SongItem';

const PlaylistView = ({ songs, visibleSongsLimit, onSongClick, currentSongIndex, unlockNextSong, points, maxSongs }) => {

    // Calculate progress towards next unlock (20 points per song)
    const COST_PER_SONG = 20;
    const progress = Math.min((points / COST_PER_SONG) * 100, 100);
    const canUnlock = points >= COST_PER_SONG;

    // Only show songs up to the limit
    
    const visibleSongs = songs.slice(0, visibleSongsLimit);
    const hasMoreSongs = visibleSongsLimit < maxSongs;

    return (
        <div className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 shadow-2xl flex flex-col h-[60vh]">
            <div className="flex justify-between items-end mb-6 border-b border-slate-700/50 pb-4">
                <div>
                    <h2 className="text-2xl font-playfair font-bold text-slate-100">Quest Log</h2>
                    <p className="text-xs text-cyan-400/60 uppercase tracking-widest mt-1">
                        {visibleSongs.length} / {maxSongs} Tracks Revealed
                    </p>
                </div>

                {/* Mini Progress Bar for Next Unlock */}
                <div className="w-32 text-right">
                    <div className="flex justify-between text-[10px] font-bold text-cyan-400/80 mb-1 tracking-wider">
                        <span>NEXT UNLOCK</span>
                        <span>{Math.min(points, COST_PER_SONG)} / {COST_PER_SONG}</span>
                    </div>
                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <ul className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                <style>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.3); border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6, 182, 212, 0.6); }
                `}</style>
                {visibleSongs.map((song, index) => (
                    <SongItem
                        key={song.id || index}
                        song={song}
                        index={index}
                        isPlaying={index === currentSongIndex}
                        onClick={onSongClick}
                    />
                ))}

                {/* Locked Region Indicator */}
                {hasMoreSongs && (
                    <li className="p-4 rounded-xl border border-slate-700/50 bg-slate-900/30 flex flex-col items-center justify-center text-center gap-3 mt-4 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="text-cyan-700 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                        </div>
                        <p className="text-cyan-500/60 text-sm font-playfair italic">
                            "More ancient melodies lie hidden..."
                        </p>

                        <button
                            onClick={unlockNextSong}
                            disabled={!canUnlock}
                            className={`
                                px-6 py-2 rounded-full font-bold text-xs tracking-widest transition-all duration-300 transform
                                ${canUnlock
                                    ? 'bg-cyan-600 text-white hover:bg-cyan-500 hover:scale-105 shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer'
                                    : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                                }
                            `}
                        >
                            {canUnlock ? "REVEAL NEXT TRACK (-20 ESSENCE)" : "GATHER MORE ESSENCE"}
                        </button>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default PlaylistView;
