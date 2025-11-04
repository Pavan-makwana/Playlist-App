import React from 'react';

// Component for an individual song tile
const SongItem = ({ song, index, isPlaying, onClick }) => {
    // Dynamic styling based on whether the song is currently playing
    const statusClass = isPlaying ? 'border-pink-500 bg-pink-900/40' : 'border-gray-700/50 hover:bg-gray-700/30';

    return (
        <li
            className={`flex items-center p-3 rounded-lg border transition duration-200 cursor-pointer ${statusClass}`}
            onClick={() => onClick(index)}
        >
            <div className="text-xl mr-3 font-mono text-pink-400">{index + 1}.</div>
            <img
                src={song.thumbnail}
                alt="Thumbnail"
                className="w-12 h-12 object-cover rounded-md mr-4"
                // Placeholder image for when the thumbnail URL is broken
                onError={(e) => e.target.src = 'https://placehold.co/48x48/1e293b/a8a29e?text=No+Art'}
            />
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{song.title}</p>
                <p className="text-xs text-gray-400">{song.channelTitle}</p>
            </div>
            {isPlaying && <span className="text-pink-400 ml-4 font-bold">▶ LIVE</span>}
        </li>
    );
};

export default SongItem;
