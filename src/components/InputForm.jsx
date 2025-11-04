import React, { useState } from 'react';

// Component for user input and initial loading
const InputForm = ({ onPlaylistSubmit, isLoading }) => {
    // Default ID for easy testing
    const [input, setInput] = useState('PLuJllDsJjN9LaDwTCzI_MIaJ0v4oz6xQX'); 

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simple validation check
        if (input.length > 10) {
            onPlaylistSubmit(input.trim());
        } else {
            // Using alert() is generally avoided, but for simple user feedback in a demo, it's quick.
            alert('Error: Please enter a valid YouTube Playlist ID (e.g., PL...).'); 
        }
    };

    return (
        <div className="p-8 bg-gray-800/50 rounded-xl shadow-lg border border-gray-700/50 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 text-neon-green">System Login</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter YouTube Playlist ID (PL...)"
                    className="w-full px-4 py-2 bg-gray-900 border border-neon-green/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-green/80"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="w-full py-3 bg-neon-green text-gray-900 font-extrabold rounded-lg shadow-neon hover:bg-white transition duration-200 disabled:opacity-50"
                    disabled={isLoading}
                >
                    {isLoading ? 'INITIATING...' : 'LOAD QUEST DATA'}
                </button>
            </form>
        </div>
    );
};

export default InputForm;
