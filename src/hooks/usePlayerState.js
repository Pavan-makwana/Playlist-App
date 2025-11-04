import { useState, useEffect, useRef, useCallback } from 'react';

// Configuration constants
const YOUTUBE_API_URL = "https://www.youtube.com/iframe_api";

// Helper to load the YouTube IFrame API script dynamically
const loadYouTubeAPI = () => {
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = YOUTUBE_API_URL;
        document.body.appendChild(tag);
    }
};

/**
 * Custom hook to manage the YouTube IFrame player instance and state.
 * @param {Array} songs - The list of loaded songs.
 */
const usePlayerState = (songs) => {
    const playerRef = useRef(null);
    const [playerStatus, setPlayerStatus] = useState('UNINITIALIZED');
    const [currentSongIndex, setCurrentSongIndex] = useState(0);

    // Function called by the global YouTube API when it's ready
    const onYouTubeIframeAPIReady = useCallback(() => {
        const createPlayer = () => {
            if (playerRef.current) return; // Prevent double initialization

            playerRef.current = new window.YT.Player('youtube-player-iframe', {
                height: '0', // Hidden player for audio-only experience
                width: '0',
                playerVars: {
                    controls: 0,
                    disablekb: 1,
                    autoplay: 0,
                    modestbranding: 1,
                    iv_load_policy: 3, // Disable annotations
                    rel: 0 // Disable related videos
                },
                events: {
                    onReady: () => setPlayerStatus('READY'),
                    onStateChange: (event) => {
                        if (event.data === window.YT.PlayerState.ENDED) {
                            setPlayerStatus('ENDED');
                        } else if (event.data === window.YT.PlayerState.PLAYING) {
                            setPlayerStatus('PLAYING');
                        } else if (event.data === window.YT.PlayerState.PAUSED) {
                            setPlayerStatus('PAUSED');
                        }
                    }
                }
            });
        };
        // Expose to the global window object as required by the YT API
        window.onYouTubeIframeAPIReady = createPlayer;
    }, []);

    // Load the YouTube IFrame API script when the component mounts
    useEffect(() => {
        loadYouTubeAPI();
        onYouTubeIframeAPIReady();
    }, [onYouTubeIframeAPIReady]);

    // Loads a specific video ID into the player and starts playback
    const playVideo = useCallback((index) => {
        if (playerRef.current && songs[index]) {
            setCurrentSongIndex(index);
            const videoId = songs[index].videoId;
            playerRef.current.loadVideoById(videoId, 0);
        }
    }, [songs]);

    // Toggles between play and pause states
    const togglePlayPause = useCallback(() => {
        if (!playerRef.current) return;
        if (playerStatus === 'PLAYING') {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    }, [playerStatus]);

    // Skips to the next video in the playlist
    const nextVideo = useCallback(() => {
        if (playerRef.current) {
            playerRef.current.nextVideo();
        }
    }, []);

    // Skips to the previous video in the playlist
    const prevVideo = useCallback(() => {
        if (playerRef.current) {
            playerRef.current.previousVideo();
        }
    }, []);

    return {
        playerStatus,
        currentSongIndex,
        playVideo,
        togglePlayPause,
        nextVideo,
        prevVideo,
        playerRef
    };
};

export default usePlayerState;
