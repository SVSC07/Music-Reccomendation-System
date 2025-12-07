# 🎵 Hindi Music Recommendation System

A web-based music recommendation system that uses machine learning to suggest similar Hindi songs based on musical features like tempo, energy, danceability, and valence. Now includes automatic database backups and WAL mode for improved performance and data safety.

## 🚀 Features

- **AI-Powered Recommendations**: Uses K-Means clustering and cosine similarity
- **Interactive Web Interface**: Clean, responsive design with search suggestions  
- **Real-time Search**: Autocomplete functionality with instant suggestions
- **Visual Feedback**: Loading states, animations, and user-friendly messages
- **Dataset Analytics**: Shows clustering information and dataset statistics
- **WAL Mode**: Write-Ahead Logging for faster database operations
- **Automatic Backups**: Scheduled database backups every 24 hours
- **Data Safety**: Keeps last 10 backups with automatic cleanup

## 📁 Project Structure

```
folder/
├── index.html          # Main frontend page
├── style.css           # Styling and responsive design
├── script.js           # Frontend JavaScript logic
├── app.py              # Flask backend server
├── hindi_songs.py      # Original ML script
├── Hindi_songs.csv     # Dataset file
└── README.md           # This file
```

## 🔧 Setup Instructions

### 1. Prerequisites
- Python 3.7+ installed
- All required Python packages (automatically installed)

### 2. Installation

The project uses a virtual environment that's already configured. All packages are installed automatically.

### 3. Running the Application

**Option 1: Run the Web Application (Recommended)**
```bash
python app.py
```
Then open your browser and go to: `http://localhost:5000`

**Option 2: Run the Original Script**
```bash
python hindi_songs.py
```

## 🎯 How to Use

1. **Start the Server**: Run `python app.py`
2. **Open Browser**: Navigate to `http://localhost:5000`
3. **Search Songs**: Type a Hindi song name in the search box
4. **Get Recommendations**: Click "Get Recommendations" or press Enter
5. **View Results**: See 5 similar songs with details

## 🤖 How It Works

1. **Data Processing**: Loads 1,000 Hindi songs from the dataset
2. **Feature Extraction**: Uses musical features (danceability, energy, tempo, valence)
3. **Clustering**: Groups songs into 4 clusters using K-Means algorithm
4. **Similarity Matching**: Finds similar songs using cosine similarity within clusters
5. **Recommendations**: Returns the top 5 most similar songs

## 📊 Dataset

- **Total Songs**: 1,184 Hindi songs
- **Sample Size**: 1,000 songs (for performance)
- **Features Used**: 7 musical characteristics
- **Clusters**: 4 groups of similar songs

## 🛠️ Technical Stack

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Responsive design with CSS Grid/Flexbox
- Fetch API for backend communication

**Backend:**
- Flask (Python web framework)
- scikit-learn (Machine Learning)
- pandas (Data manipulation)
- numpy (Numerical computing)

**Machine Learning:**
- K-Means Clustering
- Cosine Similarity
- Standard Scaler for normalization

## 📱 Features

- ✅ Responsive design (works on mobile/tablet)
- ✅ Real-time search suggestions
- ✅ Loading states and error handling
- ✅ Smooth animations and transitions
- ✅ Clean, modern UI design
- ✅ RESTful API architecture

## 🎨 UI Components

- **Search Box**: Smart autocomplete with song suggestions
- **Results Cards**: Beautiful cards showing song recommendations
- **Dataset Info**: Live statistics and cluster information
- **Loading States**: Spinner and progress indicators
- **Error Handling**: User-friendly error messages

## 🔍 API Endpoints

- `GET /api/songs` - Get all songs for autocomplete
- `POST /api/recommend` - Get song recommendations  
- `GET /api/dataset-info` - Get dataset statistics

## 📝 Example Usage

1. Type "Ek Ajnabee Haseena Se" in the search box
2. Click "Get Recommendations"
3. See 5 similar romantic songs with details

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

## 📄 License

This project is open source and available under the MIT License.