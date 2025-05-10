# Google Play Store Research Tool

A REST API application that scrapes Google Play Store data to help research app ideas. The tool fetches data about similar applications based on search queries and calculates a "winning score" for your app idea based on market competition, ratings, and other factors.

## Features

- Search for apps on Google Play Store using keywords
- Get detailed information about the apps matching your search
- Calculate a winning score for your app idea
- RESTful API design
- Intelligent filtering of irrelevant results
- Genre-specific searches for more accurate matches

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Start the application:
   ```
   npm start
   ```

For development with auto-restart:

```
npm run dev
```

## API Endpoints

- `GET /api/search?query={searchTerm}` - Search for apps matching the query
- `GET /api/app/{appId}` - Get detailed information about a specific app
- `POST /api/analyze` - Analyze an app idea and get a winning score with competitor analysis

### Analyze API

The analyze endpoint accepts a JSON payload with the following structure:

```json
{
  "idea": "your app idea description",
  "keywords": ["optional", "keywords"],
  "genre": "optional genre"
}
```

If keywords are not provided, they will be automatically extracted from the idea description. The system intelligently handles the following:

1. Automatically filters out generic "game" keywords when they appear alone to avoid returning irrelevant top game results
2. Includes the genre in search queries when provided for more relevant results
3. Filters out competitors with a similarity index less than 10 to ensure results are relevant to your idea
4. Returns all relevant competitors sorted by similarity (most similar first)

#### Response Example

```json
{
  "idea": "fitness tracker app",
  "keywords": ["fitness", "tracker", "health", "workout", "exercise"],
  "totalProductsCount": 45,
  "competitorsCount": 45,
  "ideaScore": 68,
  "avgSimilarityIndex": 72,
  "highestSimilarityIndex": 85,
  "scoreExplanation": "Good opportunity with some challenges...",
  "marketInsights": {
    "avgRating": 4.2,
    "avgInstalls": 500000,
    "avgReviews": 15000,
    "avgLast30DaysInstalls": 75000,
    "competitionLevel": "Medium",
    "marketMaturity": "Established",
    "totalApps": 45,
    "containsIAPPercentage": 75
  },
  "competitors": [
    {
      "count": 0,
      "id": "com.example.fitness",
      "title": "Example Fitness App",
      "publisher": "Example Developer",
      "totalInstalls": 1000000,
      "last30DaysInstalls": 150000,
      "rating": 4.5,
      "containsIAP": true,
      "releaseDate": "2020-01-01",
      "similarityIndex": 85,
      "url": "https://play.google.com/store/apps/details?id=com.example.fitness"
    }
    // More competitors...
  ]
}
```

#### Response Fields

- `idea`: Your original app idea
- `keywords`: Keywords used for the search (either provided or auto-extracted)
- `totalProductsCount`: Total number of competitor products found
- `ideaScore`: Score out of 100 for your app idea (higher is better)
- `avgSimilarityIndex`: Average similarity index of the top competitors
- `highestSimilarityIndex`: Highest similarity index found among competitors
- `scoreExplanation`: Detailed explanation of the score, including information about total installs and last 30 days installs per app
- `marketInsights`: Detailed metrics about the market including average last 30 days installs
- `competitors`: List of all competing apps with similarity index ≥ 10, sorted by similarity (most similar first)

## Technologies Used

- Node.js
- Express.js
- google-play-scraper - For retrieving app data
- RESTful API design principles

## License

ISC
