import React, { useState, useEffect, useCallback, useRef } from 'react';
// Firebase imports removed, as we are now using localStorage

// Import components and hooks
import usePlayerState from './hooks/usePlayerState';
import InputForm from './components/InputForm';
import PlaylistView from './components/PlaylistView';
import PlayerControls from './components/PlayerControls';

// --- 1. GLOBAL CONFIG & INITIALIZATION ---
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const MAX_SONGS_PER_FETCH = 3; // Fetch only 3 songs initially
const POINTS_TO_UNLOCK_NEXT_BATCH = 3;
const LOCAL_STORAGE_KEY = 'ludio_quest_progress';

const App = () => {
    // --- 4.1. STATE MANAGEMENT ---
    const [songs, setSongs] = useState([]);
    const [playlistId, setPlaylistId] = useState('');
    const [nextPageToken, setNextPageToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [points, setPoints] = useState(0);
    const [maxSongs] = useState(40);
    const [savedPlaylistId, setSavedPlaylistId] = useState(''); // New state for showing "Continue Quest"
    const [clickEffects, setClickEffects] = useState([]); // Visual effects for gathering
    const [visibleSongsLimit, setVisibleSongsLimit] = useState(3); // Start with 3 songs

    const playerState = usePlayerState(songs);
    const currentSong = songs[playerState.currentSongIndex];

    // --- 4.2. GAMIFICATION LOGIC (XP accumulation) ---

    // Function for manual "Gather" gain (Global Click)
    const handleGlobalClick = (e) => {
        // Only allow point gain if a playlist is actually loaded
        if (songs.length > 0) {
            setPoints(p => p + 1);

            // Add visual effect
            const id = Date.now();
            const x = e.clientX;
            const y = e.clientY;
            setClickEffects(prev => [...prev, { id, x, y }]);

            // Remove effect after animation
            setTimeout(() => {
                setClickEffects(prev => prev.filter(effect => effect.id !== id));
            }, 1000);
        }
    };

    useEffect(() => {
        // When a song ends, grant 20 points and auto-play the next track
        if (playerState.playerStatus === 'ENDED') {
            setPoints(p => p + 20);
            playerState.nextVideo();
        }
    }, [playerState.playerStatus, playerState.nextVideo]);

    // Helper to parse ISO 8601 duration
    const parseDuration = (duration) => {
        if (!duration) return "0:00";
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        const hours = (match[1] || '').replace('H', '');
        const minutes = (match[2] || '').replace('M', '');
        const seconds = (match[3] || '').replace('S', '');

        let result = '';
        if (hours) result += hours + ':';
        result += (minutes || '0').padStart(hours ? 2 : 1, '0') + ':';
        result += (seconds || '0').padStart(2, '0');
        return result;
    };

    // --- 4.3. DATA FETCHING LOGIC ---

    const fetchBatch = useCallback(async (id, token = null) => {
        if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "PASTE_YOUR_RESTRICTED_API_KEY_HERE") {
            console.error("FATAL ERROR: API Key is missing or default. Please check your .env file.");
            setSongs([]);
            setPlaylistId('');
            setNextPageToken(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        // Fetch MAX_SONGS_PER_FETCH songs (now 3)
        let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=${MAX_SONGS_PER_FETCH}&playlistId=${id}&key=${YOUTUBE_API_KEY}`;
        if (token) {
            url += `&pageToken=${token}`;
        }

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
                console.error("YouTube API Error:", data.error.message);
                setSongs([]);
                setNextPageToken(null);
                setPlaylistId(''); // Clear ID on error
                return;
            }

            const newSongs = data.items.map(item => ({
                id: item.id,
                videoId: item.contentDetails.videoId,
                title: item.snippet.title,
                channelTitle: item.snippet.channelTitle,
                thumbnail: item.snippet.thumbnails?.default?.url || 'https://placehold.co/48x48/1e293b/a8a29e?text=No+Art',
                duration: item.contentDetails.endAt ? "Live" : item.contentDetails.duration ? parseDuration(item.contentDetails.duration) : "??:??"
            }));

            setSongs(prevSongs => {
                const updatedSongs = token ? [...prevSongs, ...newSongs] : newSongs;
                return updatedSongs;
            });

            setNextPageToken(data.nextPageToken || null);
            setPlaylistId(id);

            // Play video only if it's the first batch being fetched
            if (!token && newSongs.length > 0) {
                // Must use the latest playerState closure (which is why we keep it in deps for the linter,
                playerState.playVideo(0);
            }

        } catch (error) {
            console.error("Fetch failed:", error);
        } finally {
            setIsLoading(false);
        }
    }, [playerState]);
    


    // --- 4.4. LOCAL STORAGE PERSISTENCE (LOAD) ---

    // Load progress from localStorage on initial load
    useEffect(() => {
        const loadInitialData = async () => {
            const savedProgress = localStorage.getItem(LOCAL_STORAGE_KEY);

            if (savedProgress) {
                try {
                    const data = JSON.parse(savedProgress);
                    setPoints(data.points || 0);

                    // DO NOT call fetchBatch here, forcing the InputForm to show first.
                    if (data.playlistId) {
                        setSavedPlaylistId(data.playlistId);
                    }

                    if (data.visibleSongsLimit) {
                        setVisibleSongsLimit(data.visibleSongsLimit);
                    }

                } catch (e) {
                    console.error("Error parsing stored progress:", e);
                    localStorage.removeItem(LOCAL_STORAGE_KEY);
                }
            }
            // Set loading state to false only after initial sync is done.
            setIsLoading(false);
        };

        // Start the loading sequence immediately
        setIsLoading(true);
        loadInitialData();

    }, []); 

    // --- 4.5. LOCAL STORAGE PERSISTENCE (SAVE) ---

    // Save progress to localStorage whenever key states change
    useEffect(() => {
        if (!playlistId) return; // Only save if a playlist has been loaded

        const dataToSave = JSON.stringify({
            points: points,
            playlistId: playlistId,
            nextPageToken: nextPageToken,
            visibleSongsLimit: visibleSongsLimit
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, dataToSave);
    }, [points, nextPageToken, playlistId, visibleSongsLimit]);


    // Handler for initial playlist submit (New Quest)
    const handlePlaylistSubmit = (id) => {
        // Reset state for a new playlist
        setSongs([]);
        setNextPageToken(null);
        setPoints(0);
        setVisibleSongsLimit(3); // Reset limit
        setSavedPlaylistId(''); // Clear any saved quest flag
        // Request the first batch of 3 songs
        fetchBatch(id);
        // Clear local storage when starting a new playlist
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    };

    // Handler for resuming the quest
    const handleResumeQuest = () => {
        if (savedPlaylistId) {
            // Fetch the first batch (savedPlaylistId is the ID we need)
            fetchBatch(savedPlaylistId, null);
        }
    };


    // Handler for "Unlock Next Song" (Redeem 20 points)
    const unlockNextSong = () => {
        const COST_PER_SONG = 20;

        if (points >= COST_PER_SONG) {
            setPoints(p => p - COST_PER_SONG); // Deduct points
            setVisibleSongsLimit(prev => {
                const newLimit = prev + 1;
                // If we need more songs than currently loaded, fetch next batch
                if (newLimit > songs.length && nextPageToken) {
                    fetchBatch(playlistId, nextPageToken);
                }
                return newLimit;
            });
        }
    };

    // --- 4.6. RENDER LOGIC ---
   
    const showInputForm = songs.length === 0 && !isLoading;

    return (
        <div
            className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-8 font-inter overflow-hidden relative"
            onClick={handleGlobalClick} // Global Click Handler
        >
            <style>{`
                .font-playfair { font-family: 'Playfair Display', serif; }
                
                /* Floating +1 Animation */
                @keyframes floatUp {
                    0% { transform: translateY(0) scale(1); opacity: 1; }
                    100% { transform: translateY(-50px) scale(1.5); opacity: 0; }
                }
                .float-animation {
                    animation: floatUp 0.8s ease-out forwards;
                }
            `}</style>

            {/* Floating Click Effects */}
            {clickEffects.map(effect => (
                <div
                    key={effect.id}
                    className="fixed text-cyan-400 font-bold text-2xl pointer-events-none float-animation z-50"
                    style={{ left: effect.x, top: effect.y }}
                >
                    +1
                </div>
            ))}

            <header className="text-center mb-10 z-10 pointer-events-none">
                <h1 className="text-5xl sm:text-6xl font-playfair font-bold tracking-wide text-slate-100 drop-shadow-lg">
                    LUDIO
                </h1>
                <p className="text-cyan-400/80 mt-3 text-sm tracking-widest uppercase">
                    Natural Harmony Quest
                </p>
            </header>

            {/* Hidden IFrame Player (Required element for the YouTube API hook) */}
            <div id="youtube-player-iframe" className="hidden"></div>

            {/* EXP POINTS DISPLAY (Top Right) */}
            <div className="fixed top-6 right-6 z-40 flex items-center gap-3 bg-slate-800/80 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-full shadow-lg pointer-events-none">
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
                <div className="text-right">
                    <p className="text-xs text-cyan-400 font-bold tracking-wider">ESSENCE</p>
                    <p className="text-xl font-playfair text-slate-100">{points}</p>
                </div>
            </div>


            {/* Display error message if API Key is missing */}
            {(!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "PASTE_YOUR_RESTRICTED_API_KEY_HERE") && (
                <div className="text-red-400 font-bold p-4 bg-red-900/50 border border-red-800 rounded-lg max-w-lg text-center mb-8">
                    ACCESS DENIED: Please update your VITE_YOUTUBE_API_KEY in the .env file.
                </div>
            )}

            {showInputForm && (
                <div className="z-10 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                    <InputForm
                        onPlaylistSubmit={handlePlaylistSubmit}
                        isLoading={isLoading}
                    />

                    {savedPlaylistId && (
                        <div className="mt-8 p-6 bg-slate-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl text-center shadow-xl">
                            <p className="text-cyan-200/80 mb-4 font-playfair italic text-lg">
                                "The journey continues..."
                            </p>
                            <button
                                onClick={handleResumeQuest}
                                className="bg-cyan-600 text-white px-8 py-3 rounded-full font-bold hover:bg-cyan-500 transition-all transform hover:scale-105 shadow-lg shadow-cyan-900/20"
                            >
                                Resume Quest
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Show Player UI if we have songs and are not showing the Input Form */}
            {songs.length > 0 && !showInputForm && (
                <div className="w-full max-w-4xl flex flex-col items-center z-10 gap-8" onClick={(e) => e.stopPropagation()}>

                    <PlaylistView
                        songs={songs}
                        visibleSongsLimit={visibleSongsLimit}
                        onSongClick={playerState.playVideo}
                        currentSongIndex={playerState.currentSongIndex}
                        unlockNextSong={unlockNextSong}
                        points={points}
                        maxSongs={maxSongs}
                    />

                    <div className="fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pt-6 pb-6 px-4 z-50 pointer-events-auto shadow-[0_-5px_20px_rgba(0,0,0,0.2)]">
                        <PlayerControls
                            isPlaying={playerState.playerStatus === 'PLAYING'}
                            togglePlayPause={playerState.togglePlayPause}
                            nextVideo={playerState.nextVideo}
                            prevVideo={playerState.prevVideo}
                            currentSong={currentSong}
                            playerStatus={playerState.playerStatus}
                            currentTime={playerState.currentTime}
                            duration={playerState.duration}
                        />
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="fixed top-0 left-0 w-full h-full bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                    <div className="text-cyan-200 text-2xl font-playfair italic animate-pulse">
                        Attuning to the frequency...
                    </div>
                    <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full mt-6 animate-spin"></div>
                </div>
            )}
        </div>
    );
};

export default App;
