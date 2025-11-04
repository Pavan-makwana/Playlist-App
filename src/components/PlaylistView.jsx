import React from 'react';
import SongItem from './SongItem';

// Configuration imported from the main App for consistency
const POINTS_TO_UNLOCK_NEXT_BATCH = 3;

// Component for the main playlist view, including gamification elements
const PlaylistView = ({ songs, onSongClick, currentSongIndex, unlockNextBatch, points, maxPoints }) => {
    if (songs.length === 0) return null;

    // Gamification logic: calculate progress towards next unlock
    const currentPoints = points % POINTS_TO_UNLOCK_NEXT_BATCH;
    const isReadyToUnlock = currentPoints >= POINTS_TO_UNLOCK_NEXT_BATCH;
    const remainingToUnlock = POINTS_TO_UNLOCK_NEXT_BATCH - currentPoints;
    const xpProgressPercentage = (currentPoints / POINTS_TO_UNLOCK_NEXT_BATCH) * 100;

    return (
        <div className="w-full max-w-lg space-y-4">
            <h2 className="text-2xl font-extrabold text-center text-neon-green">🎶 Track Log ({songs.length} Missions Unlocked)</h2>

            {/* Gamified XP/Progress Bar (Visual indicator of listening progress) */}
            <div className="bg-gray-700 rounded-full h-4 mb-2">
                <div
                    className="h-4 rounded-full bg-gradient-to-r from-pink-500 to-red-600 transition-all duration-500"
                    style={{ width: `${xpProgressPercentage}%` }}
                ></div>
                <p className="text-xs text-center text-white/80 mt-1">
                    XP Progress: {currentPoints} / {POINTS_TO_UNLOCK_NEXT_BATCH} songs listened
                </p>
            </div>

            {/* Unlock Button (The primary gamified action) */}
            <div className="flex justify-center">
                <button
                    onClick={unlockNextBatch}
                    disabled={!isReadyToUnlock || songs.length >= maxPoints}
                    className={`py-2 px-6 font-bold rounded-lg transition duration-300 shadow-xl ${
                        isReadyToUnlock && songs.length < maxPoints
                            ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/50'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    {songs.length >= maxPoints ? 'MAX MISSIONS REACHED (40)' :
                     isReadyToUnlock ? '🔥 UNLOCK NEXT BATCH (1 Unit)' :
                     `Listen to ${remainingToUnlock} more songs`}
                </button>
            </div>


            {/* Song List (The visible part of the playlist) */}
            <ul className="space-y-2 max-h-80 overflow-y-auto p-2 bg-gray-900/70 rounded-lg border border-gray-800">
                {songs.map((song, index) => (
                    <SongItem
                        key={song.id}
                        song={song}
                        index={index}
                        isPlaying={index === currentSongIndex}
                        onClick={onSongClick}
                    />
                ))}
            </ul>
        </div>
    );
};

export default PlaylistView;
