import React, { useState, useEffect, useCallback } from 'react';
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

    const playerState = usePlayerState(songs);
    const currentSong = songs[playerState.currentSongIndex];

    // --- 4.2. GAMIFICATION LOGIC (XP accumulation) ---
    
    // Function for manual/global click gain
    const manualPointGain = () => {
        // Only allow point gain if a playlist is actually loaded
        if (songs.length > 0) {
             setPoints(p => p + 1);
        }
    };

    useEffect(() => {
        // When a song ends, grant 1 point and auto-play the next track
        if (playerState.playerStatus === 'ENDED') {
            setPoints(p => p + 1);
            playerState.nextVideo();
        }
    }, [playerState.playerStatus, playerState.nextVideo]);

    // --- 4.3. DATA FETCHING LOGIC ---

    // FIX: Empty dependency array to ensure function stability and break the infinite loop
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
            }));
            
            // CRITICAL FIX: Use functional update for 'songs' to avoid dependency loop
            setSongs(prevSongs => {
                const updatedSongs = token ? [...prevSongs, ...newSongs] : newSongs;
                return updatedSongs;
            });

            setNextPageToken(data.nextPageToken || null);
            setPlaylistId(id);

            // Play video only if it's the first batch being fetched
            if (!token && newSongs.length > 0) {
                // Must use the latest playerState closure (which is why we keep it in deps for the linter, 
                // but the stability fix above is the primary loop breaker)
                playerState.playVideo(0);
            }

        } catch (error) {
            console.error("Fetch failed:", error);
        } finally {
            setIsLoading(false);
        }
    }, [playerState]); 
    // IMPORTANT: The dependency [playerState] is technically needed for playerState.playVideo. 
    // The previous state update fixes break the loop, but this dependency must remain for correct playback.


    // --- 4.4. LOCAL STORAGE PERSISTENCE (LOAD) ---

    // Load progress from localStorage on initial load
    useEffect(() => {
        const loadInitialData = async () => {
            const savedProgress = localStorage.getItem(LOCAL_STORAGE_KEY);
            
            if (savedProgress) {
                try {
                    const data = JSON.parse(savedProgress);
                    setPoints(data.points || 0);
                    
                    // FIX: ONLY load points and saved ID into the temporary state variable.
                    // DO NOT call fetchBatch here, forcing the InputForm to show first.
                    if (data.playlistId) {
                        setSavedPlaylistId(data.playlistId);
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

    }, [fetchBatch]); // fetchBatch is stable enough now not to loop

    // --- 4.5. LOCAL STORAGE PERSISTENCE (SAVE) ---

    // Save progress to localStorage whenever key states change
    useEffect(() => {
        if (!playlistId) return; // Only save if a playlist has been loaded

        const dataToSave = JSON.stringify({
            points: points,
            playlistId: playlistId,
            nextPageToken: nextPageToken,
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, dataToSave);
    }, [points, nextPageToken, playlistId]);


    // Handler for initial playlist submit (New Quest)
    const handlePlaylistSubmit = (id) => {
        // Reset state for a new playlist
        setSongs([]);
        setNextPageToken(null);
        setPoints(0);
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


    // Handler for the "Unlock Next Batch" button
    const unlockNextBatch = () => {
        // Correct calculation: check if current points are enough for the next expected batch number
        const requiredPoints = POINTS_TO_UNLOCK_NEXT_BATCH * (Math.floor(songs.length / MAX_SONGS_PER_FETCH) + 1);
        
        if (points >= requiredPoints && nextPageToken && songs.length < maxSongs) {
            fetchBatch(playlistId, nextPageToken);
        }
    };

    // --- 4.6. RENDER LOGIC ---
    // CONDITION FIX: InputForm is shown if songs are empty AND we are NOT loading.
    const showInputForm = songs.length === 0 && !isLoading;

    return (
        // GLOBAL CLICK XP FIX: Added onClick={manualPointGain} to the main div
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-8 font-inter" onClick={manualPointGain}>
            {/* CDN/JSX WARNING FIX: Changed <style jsx global> to standard <style> */}
            <style>{`
                /* Custom theme colors and shadows */
                .font-inter { font-family: 'Inter', sans-serif; }
                .text-neon-green { color: #00ffaa; } /* Updated to a brighter cyberpunk green */
                .bg-neon-green { background-color: #00ffaa; }
                .shadow-neon { box-shadow: 0 0 8px rgba(0, 255, 170, 0.7), 0 0 15px rgba(0, 255, 170, 0.4); }
                .text-glitch { 
                    animation: glitch 1.5s infinite alternate;
                }
                body {
                    background: radial-gradient(circle at top left, #0d0d0d, #000);
                }
                /* IMPORTANT: Prevent XP click from affecting input elements */
                input, button, a { pointer-events: auto; }
                
                .controls button {
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .controls button:hover {
                    transform: scale(1.05);
                }
                
                @keyframes pulse-neon {
                    0%, 100% { opacity: 1; text-shadow: 0 0 5px #00ffaa, 0 0 10px #00ffaa; }
                    50% { opacity: 0.5; text-shadow: none; }
                }
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
            `}</style>
            
            <header className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white text-glitch">
                    🎧 LUDIO (YouTube Music Quest)
                </h1>
                <p className="text-gray-400 mt-2 text-sm font-mono">
                    //SYSTEM/STATUS: LOCAL DATA PERSISTENCE ENABLED
                </p>
            </header>

            {/* Hidden IFrame Player (Required element for the YouTube API hook) */}
            <div id="youtube-player-iframe" className="hidden"></div>

            {/* EXP POINTS DISPLAY (Bottom Right Corner) */}
            <div className="fixed bottom-4 right-4 z-40 p-3 bg-gray-800 border border-neon-green rounded-lg shadow-neon text-right pointer-events-auto">
                <p className="text-sm font-mono text-gray-400">QUEST XP:</p>
                <p className="text-xl font-bold text-neon-green">{points} POINTS</p>
            </div>


            {/* Display error message if API Key is missing */}
            {(!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "PASTE_YOUR_RESTRICTED_API_KEY_HERE") && (
                 <div className="text-red-500 font-bold p-4 bg-red-900/50 rounded-lg max-w-lg text-center">
                    ACCESS DENIED: Please update your VITE_YOUTUBE_API_KEY in the .env file.
                 </div>
            )}

            {showInputForm && (
                <>
                    <InputForm 
                        onPlaylistSubmit={handlePlaylistSubmit} 
                        isLoading={isLoading} 
                    />
                    
                    {savedPlaylistId && (
                        <div className="mt-6 p-4 bg-gray-800 border border-yellow-500/50 rounded-lg text-center">
                            <p className="text-yellow-400 mb-3 font-mono">
                                PREVIOUS DATA FOUND: Continue Quest {savedPlaylistId.substring(0, 8)}...?
                            </p>
                            <button
                                onClick={handleResumeQuest}
                                className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
                            >
                                RESUME QUEST
                            </button>
                        </div>
                    )}
                </>
            )}
            
            {/* Show Player UI if we have songs and are not showing the Input Form */}
            {songs.length > 0 && !showInputForm && (
                <>
                    <PlaylistView
                        songs={songs}
                        onSongClick={playerState.playVideo}
                        currentSongIndex={playerState.currentSongIndex}
                        unlockNextBatch={unlockNextBatch}
                        points={points}
                        maxPoints={maxSongs}
                        nextPageToken={nextPageToken} // Pass token to check if next batch is available
                        requiredPoints={POINTS_TO_UNLOCK_NEXT_BATCH * (Math.floor(songs.length / MAX_SONGS_PER_FETCH))}
                    />
                    <PlayerControls
                        isPlaying={playerState.playerStatus === 'PLAYING'}
                        togglePlayPause={playerState.togglePlayPause}
                        nextVideo={playerState.nextVideo}
                        prevVideo={playerState.prevVideo}
                        currentSong={currentSong}
                        playerStatus={playerState.playerStatus}
                    />
                </>
            )}

            {isLoading && (
                <div className="fixed top-0 left-0 w-full h-full bg-black/90 flex flex-col items-center justify-center z-50">
                    <div className="text-neon-green text-3xl font-mono" style={{ animation: 'pulse-neon 1s infinite alternate' }}>
                        LOADING QUEST DATA... PLEASE STAND BY
                    </div>
                    <div className="w-10 h-10 border-4 border-neon-green border-t-transparent rounded-full mt-4" style={{ animation: 'spin 1s linear infinite' }}></div>
                </div>
            )}
        </div>
    );
};

export default App;
