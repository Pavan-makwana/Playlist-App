import React from 'react';

// Component for the Player Controls (The HUD)
const PlayerControls = ({ isPlaying, togglePlayPause, nextVideo, prevVideo, currentSong, playerStatus, currentTime, duration }) => {
    if (playerStatus === 'UNINITIALIZED') return null;

    const formatTime = (time) => {
        if (!time) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const progress = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
            {/* Progress Bar */}
            <div className="w-full flex items-center gap-3 px-2">
                <span className="text-xs font-mono text-cyan-500/80 w-10 text-right">{formatTime(currentTime)}</span>
                <div className="flex-1 h-1 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000 ease-linear"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <span className="text-xs font-mono text-cyan-500/80 w-10">{formatTime(duration)}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
                {/* Song Info */}
                <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-bold text-cyan-500 tracking-widest uppercase mb-1">Now Playing</p>
                    <h3 className="text-lg font-playfair font-bold text-slate-100 truncate">
                        {currentSong ? currentSong.title : "Select a Track"}
                    </h3>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={prevVideo}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors transform hover:scale-110 active:scale-95"
                        aria-label="Previous Track"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0121 8.688v8.123zM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953L9.567 7.71a1.125 1.125 0 011.683.977v8.123z" />
                        </svg>
                    </button>

                    <button
                        onClick={togglePlayPause}
                        className="w-14 h-14 flex items-center justify-center rounded-full bg-cyan-600 text-white hover:bg-cyan-500 hover:scale-105 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 ml-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={nextVideo}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors transform hover:scale-110 active:scale-95"
                        aria-label="Next Track"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.811V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlayerControls;
