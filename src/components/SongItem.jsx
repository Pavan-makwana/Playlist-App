import React from 'react';

// Component for an individual song tile
const SongItem = ({ song, index, isPlaying, onClick }) => {
    
    // Dynamic styling based on whether the song is currently playing
    const statusClass = isPlaying
        ? 'border-cyan-500/50 bg-cyan-900/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
        : 'border-slate-700/50 hover:bg-slate-800/50 hover:border-cyan-500/30';

    return (
        <li
            className={`flex items-center p-4 rounded-xl border transition-all duration-300 cursor-pointer group ${statusClass}`}
            onClick={() => onClick(index)}
        >
            <div className={`text-xl mr-4 font-playfair font-bold ${isPlaying ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}`}>
                {index + 1}.
            </div>
            <div className="relative">
                <img
                    src={song.thumbnail}
                    alt="Thumbnail"
                    className={`w-12 h-12 object-cover rounded-lg mr-4 shadow-md transition-transform duration-300 ${isPlaying ? 'scale-105' : 'group-hover:scale-105'}`}
                    onError={(e) => e.target.src = 'https://placehold.co/48x48/1e293b/06b6d4?text=No+Art'}
                />
                {isPlaying && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate transition-colors ${isPlaying ? 'text-cyan-100' : 'text-slate-300 group-hover:text-white'}`}>
                    {song.title}
                </p>
                <p className="text-xs text-slate-500 group-hover:text-cyan-400/80 transition-colors">
                    {song.channelTitle}
                </p>
            </div>

            <div className={`text-xs font-mono ml-4 ${isPlaying ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400/90'}`}>
                {song.duration}
            </div>

            {isPlaying && (
                <span className="text-cyan-400 ml-4 text-xs font-bold tracking-widest animate-pulse">
                    ACTIVE
                </span>
            )}
        </li>
    );
};

export default SongItem;
