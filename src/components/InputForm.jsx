import React, { useState } from 'react';

const InputForm = ({ onPlaylistSubmit, isLoading }) => {

    const [input, setInput] = useState('PLuJllDsJjN9LaDwTCzI_MIaJ0v4oz6xQX');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simple validation check
        if (input.length > 10) {
            onPlaylistSubmit(input.trim());
        } else {
            
            alert('Error: Please enter a valid YouTube Playlist ID (e.g., PL...).');
        }
    };

    return (
        <div className="p-8 bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-md mx-auto transform transition-all hover:border-cyan-500/40">
            <h2 className="text-2xl font-playfair font-bold mb-6 text-slate-100 text-center tracking-wide">
                Begin Your Journey
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter YouTube Playlist ID (PL...)"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all font-mono text-sm"
                        disabled={isLoading}
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"></div>
                </div>

                <button
                    type="submit"
                    className="w-full py-3 bg-cyan-600 text-white font-bold tracking-wider rounded-lg shadow-lg hover:bg-cyan-500 hover:shadow-cyan-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                    disabled={isLoading}
                >
                    {isLoading ? 'ATTUNING...' : 'EMBARK'}
                </button>
            </form>
        </div>
    );
};

export default InputForm;
