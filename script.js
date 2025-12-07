// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Global variables
let allSongs = [];
let backendAvailable = false;

// Fallback mock data for when backend is not available
const mockSongs = [
    { song_name: "Bheegi Bheegi Raaton Mein", singer: "Kishore Kumar", released_date: "1981" },
    { song_name: "Aap Ki Ankhon Mein Kuch", singer: "Lata Mangeshkar", released_date: "1972" },
    { song_name: "Tum Aa Gaye Ho Noor Aa Gaya", singer: "Mohammad Rafi", released_date: "1975" },
    { song_name: "Hamen Tumse Pyar Kitna", singer: "Kishore Kumar", released_date: "1981" },
    { song_name: "Tere Bina Zindagi Se", singer: "Lata Mangeshkar", released_date: "1975" },
    { song_name: "Ek Ajnabee Haseena Se", singer: "Kishore Kumar", released_date: "1971" },
    { song_name: "Chura Liya Hai Tumne Jo Dil Ko", singer: "Mohammad Rafi", released_date: "1973" },
    { song_name: "Pyar Deewana Hota Hai", singer: "Kishore Kumar", released_date: "1992" },
    { song_name: "Tujhse Naraz Nahi Zindagi", singer: "Lata Mangeshkar", released_date: "1983" },
    { song_name: "Kabhi Kabhie Mere Dil Mein", singer: "Mukesh", released_date: "1976" },
    { song_name: "Ye Jo Vaada Kiya", singer: "Rajesh Roshan", released_date: "1982" },
    { song_name: "Dil Deewana Bin Sajna Ke", singer: "Mohammed Rafi", released_date: "1968" },
    { song_name: "Main Pal Do Pal Ka Shayar Hoon", singer: "Mukesh", released_date: "1976" },
    { song_name: "Rim Jhim Gire Sawan", singer: "Kishore Kumar", released_date: "1979" },
    { song_name: "Lag Jaa Gale", singer: "Lata Mangeshkar", released_date: "1964" }
];

const mockRecommendations = {
    "Ek Ajnabee Haseena Se": [
        { song_name: "Pyar Deewana Hota Hai", singer: "Kishore Kumar", released_date: "1992" },
        { song_name: "Hamen Tumse Pyar Kitna", singer: "Kishore Kumar", released_date: "1981" },
        { song_name: "Bheegi Bheegi Raaton Mein", singer: "Kishore Kumar", released_date: "1981" },
        { song_name: "Main Pal Do Pal Ka Shayar Hoon", singer: "Mukesh", released_date: "1976" },
        { song_name: "Ye Jo Vaada Kiya", singer: "Rajesh Roshan", released_date: "1982" }
    ],
    "Chura Liya Hai Tumne Jo Dil Ko": [
        { song_name: "Tum Aa Gaye Ho Noor Aa Gaya", singer: "Mohammad Rafi", released_date: "1975" },
        { song_name: "Aap Ki Ankhon Mein Kuch", singer: "Lata Mangeshkar", released_date: "1972" },
        { song_name: "Lag Jaa Gale", singer: "Lata Mangeshkar", released_date: "1964" },
        { song_name: "Dil Deewana Bin Sajna Ke", singer: "Mohammed Rafi", released_date: "1968" },
        { song_name: "Rim Jhim Gire Sawan", singer: "Kishore Kumar", released_date: "1979" }
    ]
};

class MusicRecommender {
    constructor() {
        this.songInput = document.getElementById('songInput');
        this.recommendBtn = document.getElementById('recommendBtn');
        this.suggestions = document.getElementById('suggestions');
        this.loading = document.getElementById('loading');
        this.results = document.getElementById('results');
        this.recommendationsList = document.getElementById('recommendationsList');
        this.totalSongs = document.getElementById('totalSongs');
        // Player elements (added in index.html)
        this.embedInput = document.getElementById('embedInput');
        this.playYoutubeBtn = document.getElementById('playYoutubeBtn');
        this.playSpotifyBtn = document.getElementById('playSpotifyBtn');
        this.youtubePlayer = document.getElementById('youtubePlayer');
        this.spotifyPlayer = document.getElementById('spotifyPlayer');
        
        this.initializeEventListeners();
        this.initPlayerControls();
        this.loadDatasetInfo();
    }

    initializeEventListeners() {
        this.songInput.addEventListener('input', (e) => this.handleInput(e));
        this.songInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.getRecommendations();
        });
        this.recommendBtn.addEventListener('click', () => this.getRecommendations());
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.songInput.contains(e.target) && !this.suggestions.contains(e.target)) {
                this.hideSuggestions();
            }
        });
    }

    async loadDatasetInfo() {
        try {
            // Test if backend is available
            const testResponse = await fetch(`${API_BASE_URL}/dataset-info`, {
                method: 'GET',
                timeout: 3000
            });
            
            if (testResponse.ok) {
                backendAvailable = true;
                console.log('✅ Backend connected successfully!');
                
                // Load all songs for autocomplete
                const songsResponse = await fetch(`${API_BASE_URL}/songs`);
                const songsData = await songsResponse.json();
                
                if (songsData.success) {
                    allSongs = songsData.songs;
                }
                
                // Load dataset info
                const infoData = await testResponse.json();
                if (infoData.success) {
                    this.totalSongs.textContent = infoData.total_songs.toLocaleString();
                }
            }
        } catch (error) {
            console.warn('⚠️ Backend not available, using mock data:', error.message);
            backendAvailable = false;
            
            // Use mock data as fallback
            allSongs = mockSongs;
            this.totalSongs.textContent = '1,000 (Demo)';
            
            // Show info message to user
            this.showInfo('Demo mode: Start the Python server (python app.py) for full functionality!');
        }
    }

    handleInput(e) {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }

        // Use appropriate data source based on backend availability
        const songs = allSongs.length > 0 ? allSongs : mockSongs;
        const filteredSongs = songs.filter(song => 
            song.song_name.toLowerCase().includes(query)
        ).slice(0, 5);

        this.showSuggestions(filteredSongs);
    }

    showSuggestions(songs) {
        if (songs.length === 0) {
            this.hideSuggestions();
            return;
        }

        this.suggestions.innerHTML = songs.map(song => 
            `<div class="suggestion-item" onclick="musicRecommender.selectSong('${song.song_name}')">
                <strong>${song.song_name}</strong><br>
                <small style="color: #666;">${song.singer} • ${song.released_date}</small>
            </div>`
        ).join('');

        this.suggestions.style.display = 'block';
    }

    hideSuggestions() {
        this.suggestions.style.display = 'none';
    }

    selectSong(songName) {
        this.songInput.value = songName;
        this.hideSuggestions();
        this.getRecommendations();
    }

    async getRecommendations() {
        const songName = this.songInput.value.trim();
        
        if (!songName) {
            this.showError('Please enter a song name');
            return;
        }

        this.showLoading();
        this.hideResults();
        this.hideMessages();
        
        try {
            // Simulate API delay
            await this.delay(1500);
            
            const recommendations = await this.fetchRecommendations(songName);
            this.displayRecommendations(songName, recommendations);
            
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    async fetchRecommendations(songName) {
        if (backendAvailable) {
            try {
                const response = await fetch(`${API_BASE_URL}/recommend`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        song_name: songName,
                        num_recommendations: 5
                    })
                });
                
                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }
                
                return data.recommendations;
            } catch (error) {
                // Fall back to mock data if backend fails
                console.warn('Backend failed, falling back to mock data');
                return this.getMockRecommendations(songName);
            }
        } else {
            // Use mock recommendations
            return this.getMockRecommendations(songName);
        }
    }

    getMockRecommendations(songName) {
        // Check if song exists in mock data
        const songs = allSongs.length > 0 ? allSongs : mockSongs;
        const songExists = songs.some(song => 
            song.song_name.toLowerCase().includes(songName.toLowerCase())
        );

        if (!songExists) {
            throw new Error(`Song "${songName}" not found in dataset. Try: "Ek Ajnabee Haseena Se" or "Chura Liya Hai Tumne Jo Dil Ko"`);
        }

        // Find recommendations for similar songs
        for (const [key, recs] of Object.entries(mockRecommendations)) {
            if (key.toLowerCase().includes(songName.toLowerCase()) || 
                songName.toLowerCase().includes(key.toLowerCase())) {
                return recs;
            }
        }

        // If no specific recommendations, return random ones
        const shuffled = [...mockSongs].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 5);
    }



    displayRecommendations(originalSong, recommendations) {
        const html = recommendations.map((song, index) => `
            <div class="song-card" style="animation-delay: ${index * 0.1}s">
                <div class="song-title">${song.song_name}</div>
                <div class="song-details">
                    <span class="song-singer">👤 ${song.singer}</span>
                    <span class="song-date">📅 ${song.released_date}</span>
                </div>
                <div class="song-actions" style="margin-top:.5rem;display:flex;gap:.5rem;">
                    <button class="play-youtube-small" data-song="${song.song_name}">▶️ YouTube</button>
                    <button class="play-spotify-small" data-song="${song.song_name}">Spotify</button>
                </div>
            </div>
        `).join('');

        this.recommendationsList.innerHTML = html;
        this.results.querySelector('h2').textContent = `Songs similar to "${originalSong}"`;
        this.showResults();
        this.showSuccess(`Found ${recommendations.length} similar songs!`);
        
        // Add animation
        this.addCardAnimations();
        // Attach click handlers for quick-play buttons
        setTimeout(() => {
            document.querySelectorAll('.play-youtube-small').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const s = e.currentTarget.getAttribute('data-song');
                    this.playYouTubeForSong(s);
                });
            });

            document.querySelectorAll('.play-spotify-small').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const s = e.currentTarget.getAttribute('data-song');
                    this.prefillSpotify(s);
                });
            });
        }, 0);
    }

    addCardAnimations() {
        const cards = document.querySelectorAll('.song-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    /* ----------------------- Player helpers ----------------------- */
    initPlayerControls() {
        // Attach player buttons if they exist
        if (this.playYoutubeBtn) {
            this.playYoutubeBtn.addEventListener('click', () => this.playYouTubeQuery());
        }

        if (this.playSpotifyBtn) {
            this.playSpotifyBtn.addEventListener('click', () => this.playSpotifyFromInput());
        }
    }

    playYouTubeQuery(query) {
        const q = (query || (this.embedInput && this.embedInput.value || '')).trim();
        if (!q) {
            this.showError('Enter a YouTube search term or paste a YouTube URL');
            return;
        }

        // Try to extract a YouTube video id if a URL was pasted
        const ytIdMatch = q.match(/(?:v=|youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/);
        let src = '';
        if (ytIdMatch) {
            src = `https://www.youtube.com/embed/${ytIdMatch[1]}?autoplay=1`;
        } else {
            // Use the search-based embed which shows results for the query
            src = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q)}&autoplay=1`;
        }

        if (this.youtubePlayer) this.youtubePlayer.src = src;
        if (this.youtubePlayer && this.youtubePlayer.parentNode) this.youtubePlayer.parentNode.style.display = 'block';
        if (this.spotifyPlayer && this.spotifyPlayer.parentNode) this.spotifyPlayer.parentNode.style.display = 'none';
    }

    playSpotifyFromInput() {
        const q = (this.embedInput && this.embedInput.value || '').trim();
        if (!q) {
            this.showError('Paste a Spotify track URL or URI');
            return;
        }

        // Try to extract track id from common Spotify URL/URI formats
        let match = q.match(/open\.spotify\.com\/track\/([A-Za-z0-9]+)(?:\?|$)/) || q.match(/spotify:track:([A-Za-z0-9]+)/);
        if (!match) {
            this.showError('Could not parse Spotify track id. Paste a URL like https://open.spotify.com/track/{id} or spotify:track:{id}');
            return;
        }

        const trackId = match[1];
        const src = `https://open.spotify.com/embed/track/${trackId}`;

        if (this.spotifyPlayer) this.spotifyPlayer.src = src;
        if (this.spotifyPlayer && this.spotifyPlayer.parentNode) this.spotifyPlayer.parentNode.style.display = 'block';
        if (this.youtubePlayer && this.youtubePlayer.parentNode) this.youtubePlayer.parentNode.style.display = 'none';
    }

    // Called from the recommendation cards to quickly search YouTube for the given song
    playYouTubeForSong(songName) {
        if (!songName) return;
        // Use song name as search query; add "Hindi song" to improve relevance
        const q = `${songName} Hindi song`;
        if (this.embedInput) this.embedInput.value = q;
        this.playYouTubeQuery(q);
    }

    // Called from cards to prompt user to paste Spotify URL for this song
    prefillSpotify(songName) {
        if (this.embedInput) {
            this.embedInput.value = '';
        }
        this.showInfo(`To play on Spotify: paste the track URL/URI for "${songName}" into the box and click Play Spotify.`);
        if (this.embedInput) this.embedInput.focus();
    }

    showLoading() {
        this.loading.style.display = 'block';
        this.recommendBtn.disabled = true;
        this.recommendBtn.textContent = 'Searching...';
    }

    hideLoading() {
        this.loading.style.display = 'none';
        this.recommendBtn.disabled = false;
        this.recommendBtn.textContent = 'Get Recommendations';
    }

    showResults() {
        this.results.style.display = 'block';
        this.results.scrollIntoView({ behavior: 'smooth' });
    }

    hideResults() {
        this.results.style.display = 'none';
    }

    showError(message) {
        this.hideMessages();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.loading.parentNode.insertBefore(errorDiv, this.loading.nextSibling);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    showSuccess(message) {
        this.hideMessages();
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        this.results.parentNode.insertBefore(successDiv, this.results);
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 3000);
    }

    showInfo(message) {
        this.hideMessages();
        const infoDiv = document.createElement('div');
        infoDiv.className = 'info-message';
        infoDiv.textContent = message;
        this.loading.parentNode.insertBefore(infoDiv, this.loading.nextSibling);
        
        setTimeout(() => {
            if (infoDiv.parentNode) {
                infoDiv.remove();
            }
        }, 8000);
    }

    hideMessages() {
        document.querySelectorAll('.error-message, .success-message, .info-message').forEach(el => el.remove());
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.musicRecommender = new MusicRecommender();
});

// Add some sample interactions for demo purposes
document.addEventListener('DOMContentLoaded', () => {
    // Add a subtle entrance animation
    const main = document.querySelector('main');
    main.style.opacity = '0';
    main.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        main.style.transition = 'all 0.8s ease';
        main.style.opacity = '1';
        main.style.transform = 'translateY(0)';
    }, 300);
});