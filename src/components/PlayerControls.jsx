import React from 'react';

// Component for the Player Controls (The HUD)
const PlayerControls = ({ isPlaying, togglePlayPause, nextVideo, prevVideo, currentSong, playerStatus }) => {
    if (playerStatus === 'UNINITIALIZED') return null;

    const playPauseIcon = isPlaying ? '⏸️' : '▶️';
    const statusText = isPlaying ? "Playing" : playerStatus === 'PAUSED' ? "Paused" : "Ready";

    return (
        <div className="controls mt-8 bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-gray-700/50 w-full max-w-md text-center space-y-4">
            <p className="text-sm font-light text-gray-400">NOW PLAYING</p>
            <h3 className="text-xl font-extrabold text-neon-green truncate px-4">
                {currentSong ? currentSong.title : "No Track Selected"}
            </h3>

            <div className="flex justify-center items-center gap-6">
                <button
                    onClick={prevVideo}
                    className="bg-pink-600 hover:bg-pink-500 w-12 h-12 text-2xl rounded-full"
                    aria-label="Previous Track"
                >
                    ⏮️
                </button>
                <button
                    onClick={togglePlayPause}
                    className="bg-neon-green text-gray-900 hover:bg-white w-16 h-16 text-3xl shadow-lg shadow-neon-green/50 rounded-full"
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {playPauseIcon}
                </button>
                <button
                    onClick={nextVideo}
                    className="bg-pink-600 hover:bg-pink-500 w-12 h-12 text-2xl rounded-full"
                    aria-label="Next Track"
                >
                    ⏭️
                </button>
            </div>
            <p className="status text-sm text-gray-400">Status: {statusText}</p>
        </div>
    );
};

export default PlayerControls;
