const gplay = require("google-play-scraper");
const scorer = require("../utils/scorer");
const keywordExtractor = require("../utils/keywordExtractor");
const similarityCalculator = require("../utils/similarityCalculator");
const installsCalculator = require("../utils/installsCalculator");

/**
 * Analyze an app idea and calculate a winning score
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
exports.analyzeIdea = async (req, res, next) => {
  try {
    const { idea, keywords, genre, country } = req.body;

    // Validate request body
    if (!idea) {
      return res.status(400).json({
        error: "Missing idea",
        message: "Please provide an app idea to analyze",
      });
    }

    // Auto-extract keywords if not provided
    let extractedKeywords = keywords || keywordExtractor.extractKeywords(idea);

    // Filter out "game" keyword if it appears alone (to avoid getting all top games)
    extractedKeywords = extractedKeywords.filter(
      (keyword) =>
        !(keyword.toLowerCase() === "game" || keyword.toLowerCase() === "games")
    );

    // If we've removed all keywords, get at least one from the idea
    if (extractedKeywords.length === 0) {
      const fallbackKeywords = idea
        .toLowerCase()
        .split(" ")
        .filter(
          (word) => word.length > 3 && word !== "game" && word !== "games"
        );

      if (fallbackKeywords.length > 0) {
        extractedKeywords = [fallbackKeywords[0]];
      } else {
        extractedKeywords = ["app"]; // Last resort fallback
      }
    }

    console.log(
      `Analyzing idea: "${idea}" with keywords: ${extractedKeywords.join(", ")}`
    );

    // Create app idea object for similarity calculations
    const appIdea = {
      idea,
      keywords: extractedKeywords,
      genre,
    };

    // Get competitors for each keyword
    const competitorPromises = extractedKeywords.map(async (term) => {
      // Search for apps with the keyword
      console.log(`Searching for term: "${term}"`);

      // If genre is provided, include it in the search term
      const searchTerm = genre ? `${term} ${genre}` : term;

      const results = await gplay.search({
        term: searchTerm,
        num: 15, // Increased number to get more data
        fullDetail: true,
        country: country || "us",
        lang: "en",
      });

      return results;
    });

    // Wait for all searches to complete
    const competitorResults = await Promise.all(competitorPromises);

    // Flatten and deduplicate the results
    const allCompetitors = [];
    const appIds = new Set();

    competitorResults.forEach((results) => {
      results.forEach((app) => {
        if (!appIds.has(app.appId)) {
          appIds.add(app.appId);
          allCompetitors.push(app);
        }
      });
    });

    // Calculate winning score
    const analysisResult = scorer.calculateWinningScore(allCompetitors);

    // Calculate similarity index for each competitor
    const competitorsWithSimilarity = allCompetitors.map((app) => {
      // Calculate similarity index
      const similarityIndex = similarityCalculator.calculateSimilarityIndex(
        appIdea,
        app
      );

      // Calculate last 30 days installs estimate
      const last30DaysInstalls = installsCalculator.calculateLast30DaysInstalls(
        app.minInstalls || 0,
        app.released
      );

      return {
        ...app,
        similarityIndex,
        last30DaysInstalls,
      };
    });

    // Filter out competitors with similarity index less than 10
    const filteredCompetitors = competitorsWithSimilarity.filter(
      (app) => app.similarityIndex >= 10
    );

    // Sort by similarity index (descending)
    filteredCompetitors.sort((a, b) => b.similarityIndex - a.similarityIndex);

    // Calculate average similarity index of top 10 competitors
    const topCompetitors = filteredCompetitors.slice(0, 10);
    const avgSimilarityIndex =
      topCompetitors.length > 0
        ? topCompetitors.reduce((sum, app) => sum + app.similarityIndex, 0) /
          topCompetitors.length
        : 0;

    // Get the highest similarity index
    const highestSimilarityIndex =
      filteredCompetitors.length > 0
        ? filteredCompetitors[0].similarityIndex
        : 0;

    // Calculate average last 30 days installs
    const avgLast30DaysInstalls =
      filteredCompetitors.length > 0
        ? Math.round(
            filteredCompetitors.reduce(
              (sum, app) => sum + app.last30DaysInstalls,
              0
            ) / filteredCompetitors.length
          )
        : 0;

    // Return the enhanced analysis result with filtered competitors
    return res.json({
      idea,
      keywords: extractedKeywords,
      totalProductsCount: filteredCompetitors.length,
      competitorsCount: filteredCompetitors.length,
      ideaScore: analysisResult.score,
      avgSimilarityIndex: Math.round(avgSimilarityIndex),
      highestSimilarityIndex: highestSimilarityIndex,
      scoreExplanation: analysisResult.explanation,
      marketInsights: {
        avgRating: analysisResult.avgRating,
        avgInstalls: analysisResult.avgInstalls,
        avgReviews: analysisResult.avgReviews,
        avgLast30DaysInstalls: avgLast30DaysInstalls,
        competitionLevel: analysisResult.competitionLevel,
        marketMaturity: analysisResult.marketMaturity,
        totalApps: filteredCompetitors.length,
        containsIAPPercentage:
          filteredCompetitors.length > 0
            ? Math.round(
                (filteredCompetitors.filter(
                  (app) => app.adSupported || app.containsAds
                ).length /
                  filteredCompetitors.length) *
                  100
              )
            : 0,
      },
      // Return all filtered competitors sorted by similarity index
      competitors: filteredCompetitors.map((app, index) => ({
        count: index,
        id: app.appId,
        title: app.title,
        publisher: app.developer,
        totalInstalls: app.minInstalls || 0,
        last30DaysInstalls: app.last30DaysInstalls,
        rating: app.score,
        containsIAP: app.adSupported || app.containsAds || false,
        releaseDate: app.released,
        similarityIndex: app.similarityIndex,
        url: app.url,
      })),
    });
  } catch (error) {
    console.error("Analysis error:", error);
    next(error);
  }
};
