const gplay = require("google-play-scraper");

/**
 * Get detailed information about a specific app
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
exports.getAppDetails = async (req, res, next) => {
  try {
    const { appId } = req.params;

    if (!appId) {
      return res.status(400).json({
        error: "Missing app ID",
        message: "Please provide an app ID",
      });
    }

    // Get app details
    const appDetails = await gplay.app({
      appId,
      lang: "en",
      country: "us",
    });

    // Process the app details
    const processedDetails = {
      id: appDetails.appId,
      title: appDetails.title,
      description: appDetails.description,
      summary: appDetails.summary,
      developer: appDetails.developer,
      developerId: appDetails.developerId,
      icon: appDetails.icon,
      score: appDetails.score,
      scoreText: appDetails.scoreText,
      ratings: appDetails.ratings,
      reviews: appDetails.reviews,
      price: appDetails.price,
      free: appDetails.free,
      currency: appDetails.currency,
      size: appDetails.size,
      minInstalls: appDetails.minInstalls,
      maxInstalls: appDetails.maxInstalls,
      installs: appDetails.installs,
      androidVersionText: appDetails.androidVersionText,
      androidVersion: appDetails.androidVersion,
      released: appDetails.released,
      updated: appDetails.updated,
      genre: appDetails.genre,
      genreId: appDetails.genreId,
      familyGenre: appDetails.familyGenre,
      familyGenreId: appDetails.familyGenreId,
      contentRating: appDetails.contentRating,
      screenshots: appDetails.screenshots,
      video: appDetails.video,
      videoImage: appDetails.videoImage,
      contentRatingDescription: appDetails.contentRatingDescription,
      adSupported: appDetails.adSupported,
      containsAds: appDetails.containsAds,
      url: appDetails.url,
      version: appDetails.version,
      recentChanges: appDetails.recentChanges || "",
      histogram: appDetails.histogram,
    };

    return res.json(processedDetails);
  } catch (error) {
    // Check if it's an app not found error
    if (error.message === "App not found (404)") {
      return res.status(404).json({
        error: "App not found",
        message: `App with ID "${req.params.appId}" was not found`,
      });
    }

    next(error);
  }
};
