const gplay = require("google-play-scraper");

/**
 * Search for apps using the provided query
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
exports.searchApps = async (req, res, next) => {
  try {
    const { query } = req.query;

    console.log("query",query);

    if (!query) {
      return res.status(400).json({
        error: "Missing query parameter",
        message: "Please provide a search query",
      });
    }

    // Search for apps with the provided query
    const results = await gplay.search({
      term: query,
      num: 1000, // Number of apps to retrieve
      fullDetail: false, // We don't need full details for search results
      country: "us",
      lang: "en",
    });

    // Process the results
    const processedResults = results.map((app) => ({
      id: app.appId,
      title: app.title,
      summary: app.summary,
      developer: app.developer,
      icon: app.icon,
      score: app.score,
      ratings: app.ratings,
      price: app.price,
      free: app.free,
      url: app.url,
      genre: app.genre,
      genreId: app.genreId,
    }));

    // Return the processed results
    return res.json({
      query,
      count: processedResults.length,
      results: processedResults,
    });
  } catch (error) {
    next(error);
  }
};
