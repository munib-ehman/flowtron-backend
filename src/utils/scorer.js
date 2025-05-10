/**
 * Calculate a winning score for an app idea based on competitor data
 * @param {Array} competitors - Array of competitor app objects
 * @returns {Object} - Object with the score and explanation
 */
exports.calculateWinningScore = (competitors) => {
  // Get environment variables for weights
  const RATING_WEIGHT = parseFloat(process.env.RATING_WEIGHT) || 0.3;
  const INSTALLS_WEIGHT = parseFloat(process.env.INSTALLS_WEIGHT) || 0.25;
  const REVIEWS_WEIGHT = parseFloat(process.env.REVIEWS_WEIGHT) || 0.2;
  const AGE_WEIGHT = parseFloat(process.env.AGE_WEIGHT) || 0.15;
  const COMPETITION_WEIGHT = parseFloat(process.env.COMPETITION_WEIGHT) || 0.1;

  // If no competitors, return perfect score
  if (!competitors || competitors.length === 0) {
    return {
      score: 100,
      explanation:
        "No competitors found. This might indicate a new market opportunity or that your search terms need refinement.",
      avgRating: 0,
      avgInstalls: 0,
      avgReviews: 0,
      competitionLevel: "None",
      marketMaturity: "New",
    };
  }

  // Calculate average scores
  let totalRating = 0;
  let totalInstalls = 0;
  let totalReviews = 0;
  let totalAgeInDays = 0;
  let appsWithReleaseDate = 0;

  const now = new Date();

  competitors.forEach((app) => {
    // Add ratings
    totalRating += app.score || 0;

    // Add installs (convert string to number)
    if (app.minInstalls) {
      totalInstalls += app.minInstalls;
    }

    // Add reviews
    if (app.reviews) {
      totalReviews += app.reviews;
    }

    // Calculate app age if release date is available
    if (app.released) {
      const releaseDate = new Date(app.released);
      const ageInDays = Math.floor((now - releaseDate) / (1000 * 60 * 60 * 24));
      totalAgeInDays += ageInDays;
      appsWithReleaseDate++;
    }
  });

  const competitorsCount = competitors.length;
  const avgRating = totalRating / competitorsCount;
  const avgInstalls = totalInstalls / competitorsCount;
  const avgReviews = totalReviews / competitorsCount;
  const avgAgeInDays =
    appsWithReleaseDate > 0 ? totalAgeInDays / appsWithReleaseDate : 0;

  // Calculate scores for each factor (higher is better for your app idea)
  const ratingScore = calculateRatingScore(avgRating);
  const installsScore = calculateInstallsScore(avgInstalls);
  const reviewsScore = calculateReviewsScore(avgReviews);
  const ageScore = calculateAgeScore(avgAgeInDays);
  const competitionScore = calculateCompetitionScore(competitorsCount);

  // Calculate overall score (higher is better)
  const overallScore = Math.round(
    ratingScore * RATING_WEIGHT +
      installsScore * INSTALLS_WEIGHT +
      reviewsScore * REVIEWS_WEIGHT +
      ageScore * AGE_WEIGHT +
      competitionScore * COMPETITION_WEIGHT
  );

  // Generate explanation
  const explanation = generateScoreExplanation(
    ratingScore,
    installsScore,
    reviewsScore,
    ageScore,
    competitionScore,
    avgRating,
    avgInstalls,
    avgReviews,
    avgAgeInDays,
    competitorsCount
  );

  // Determine competition level
  const competitionLevel = determineCompetitionLevel(
    competitorsCount,
    avgInstalls,
    avgRating
  );

  // Determine market maturity
  const marketMaturity = determineMarketMaturity(avgAgeInDays, avgInstalls);

  return {
    score: overallScore,
    explanation,
    avgRating,
    avgInstalls,
    avgReviews,
    competitionLevel,
    marketMaturity,
  };
};

/**
 * Calculate a score based on average competitor rating
 * @param {number} avgRating - Average rating of competitors
 * @returns {number} - Score (0-100)
 */
function calculateRatingScore(avgRating) {
  // If average rating is high (4.5+), the market has high expectations
  // If average rating is low, there's opportunity to do better
  if (avgRating === 0) return 100; // No ratings data

  if (avgRating >= 4.5) return 40;
  if (avgRating >= 4.0) return 50;
  if (avgRating >= 3.5) return 60;
  if (avgRating >= 3.0) return 70;
  if (avgRating >= 2.5) return 80;
  return 90; // Very poor competitors, great opportunity
}

/**
 * Calculate a score based on average competitor installs
 * @param {number} avgInstalls - Average installs of competitors
 * @returns {number} - Score (0-100)
 */
function calculateInstallsScore(avgInstalls) {
  // High installs means proven market but tough competition
  // Low installs could mean untapped potential or low demand
  if (avgInstalls === 0) return 100; // No installs data

  if (avgInstalls >= 10000000) return 30; // 10M+ installs
  if (avgInstalls >= 1000000) return 40; // 1M+ installs
  if (avgInstalls >= 500000) return 50; // 500K+ installs
  if (avgInstalls >= 100000) return 60; // 100K+ installs
  if (avgInstalls >= 50000) return 70; // 50K+ installs
  if (avgInstalls >= 10000) return 80; // 10K+ installs
  return 90; // Very few installs, could be easier to compete
}

/**
 * Calculate a score based on average competitor reviews
 * @param {number} avgReviews - Average reviews of competitors
 * @returns {number} - Score (0-100)
 */
function calculateReviewsScore(avgReviews) {
  // Many reviews indicates higher user engagement and stronger competition
  if (avgReviews === 0) return 100; // No reviews data

  if (avgReviews >= 1000000) return 30; // 1M+ reviews
  if (avgReviews >= 100000) return 40; // 100K+ reviews
  if (avgReviews >= 10000) return 50; // 10K+ reviews
  if (avgReviews >= 5000) return 60; // 5K+ reviews
  if (avgReviews >= 1000) return 70; // 1K+ reviews
  if (avgReviews >= 500) return 80; // 500+ reviews
  if (avgReviews >= 100) return 90; // 100+ reviews
  return 95; // Very few reviews
}

/**
 * Calculate a score based on average competitor age
 * @param {number} avgAgeInDays - Average age of competitors in days
 * @returns {number} - Score (0-100)
 */
function calculateAgeScore(avgAgeInDays) {
  // Older apps indicate mature market, newer apps indicate growing market
  if (avgAgeInDays === 0) return 100; // No age data

  if (avgAgeInDays >= 2190) return 40; // 6+ years
  if (avgAgeInDays >= 1460) return 50; // 4+ years
  if (avgAgeInDays >= 730) return 60; // 2+ years
  if (avgAgeInDays >= 365) return 70; // 1+ year
  if (avgAgeInDays >= 180) return 80; // 6+ months
  if (avgAgeInDays >= 90) return 85; // 3+ months
  return 90; // Very new market
}

/**
 * Calculate a score based on number of competitors
 * @param {number} competitorsCount - Number of competitors
 * @returns {number} - Score (0-100)
 */
function calculateCompetitionScore(competitorsCount) {
  // More competitors means more difficult to stand out
  if (competitorsCount >= 50) return 30;
  if (competitorsCount >= 30) return 40;
  if (competitorsCount >= 20) return 50;
  if (competitorsCount >= 10) return 60;
  if (competitorsCount >= 5) return 70;
  if (competitorsCount >= 3) return 80;
  if (competitorsCount >= 1) return 90;
  return 100; // No competitors
}

/**
 * Generate an explanation for the score
 * @param {number} ratingScore - Rating score
 * @param {number} installsScore - Installs score
 * @param {number} reviewsScore - Reviews score
 * @param {number} ageScore - Age score
 * @param {number} competitionScore - Competition score
 * @param {number} avgRating - Average rating
 * @param {number} avgInstalls - Average installs
 * @param {number} avgReviews - Average reviews
 * @param {number} avgAgeInDays - Average age in days
 * @param {number} competitorsCount - Number of competitors
 * @returns {string} - Explanation
 */
function generateScoreExplanation(
  ratingScore,
  installsScore,
  reviewsScore,
  ageScore,
  competitionScore,
  avgRating,
  avgInstalls,
  avgReviews,
  avgAgeInDays,
  competitorsCount
) {
  const avgAgeInYears = (avgAgeInDays / 365).toFixed(1);
  let explanation = "";

  // Add overall assessment
  if (competitorsCount === 0) {
    explanation =
      "No direct competitors found, which could indicate a unique opportunity or that your search terms need refinement. ";
    return explanation;
  }

  // Determine overall opportunity level
  const overallScore = Math.round(
    ratingScore * 0.3 +
      installsScore * 0.25 +
      reviewsScore * 0.2 +
      ageScore * 0.15 +
      competitionScore * 0.1
  );

  if (overallScore >= 80) {
    explanation = "Great opportunity! ";
  } else if (overallScore >= 60) {
    explanation = "Good opportunity with some challenges. ";
  } else if (overallScore >= 40) {
    explanation = "Challenging market with established competitors. ";
  } else {
    explanation = "Very competitive market with strong existing players. ";
  }

  // Estimate the average 30-day installs based on the app age and total installs
  let est30DayInstalls = 0;
  if (avgAgeInDays < 30) {
    est30DayInstalls = avgInstalls;
  } else if (avgAgeInDays < 90) {
    est30DayInstalls = avgInstalls * 0.6; // 60% of total installs in last 30 days
  } else if (avgAgeInDays < 180) {
    est30DayInstalls = avgInstalls * 0.4; // 40% of total installs in last 30 days
  } else if (avgAgeInDays < 365) {
    est30DayInstalls = avgInstalls * 0.2; // 20% of total installs in last 30 days
  } else if (avgAgeInDays < 730) {
    est30DayInstalls = avgInstalls * 0.1; // 10% of total installs in last 30 days
  } else {
    est30DayInstalls = avgInstalls * 0.05; // 5% of total installs in last 30 days
  }

  // Add competitor assessment
  explanation += `Found ${competitorsCount} competitors with an average rating of ${avgRating.toFixed(
    1
  )}/5, `;
  explanation += `approximately ${formatNumber(
    avgInstalls
  )} total installs per app, `;
  explanation += `with an estimated ${formatNumber(
    Math.round(est30DayInstalls)
  )} installs per app in the last 30 days, `;
  explanation += `and an average age of ${avgAgeInYears} years. `;

  // Add specific insights
  if (ratingScore >= 70) {
    explanation +=
      "Existing apps have relatively low ratings, indicating potential to win with better quality. ";
  } else if (ratingScore <= 50) {
    explanation +=
      "Existing apps have high ratings, indicating a market with high quality standards. ";
  }

  if (installsScore >= 70) {
    explanation +=
      "The market has relatively few installs, suggesting room for growth. ";
  } else if (installsScore <= 50) {
    explanation +=
      "The market has many installs, indicating proven demand but tough competition. ";
  }

  if (ageScore >= 70) {
    explanation += "This is a relatively new market. ";
  } else if (ageScore <= 50) {
    explanation += "This is a mature market with long-established players. ";
  }

  return explanation;
}

/**
 * Format a number with K, M, B suffixes
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
function formatNumber(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

/**
 * Determine the competition level
 * @param {number} competitorsCount - Number of competitors
 * @param {number} avgInstalls - Average installs
 * @param {number} avgRating - Average rating
 * @returns {string} - Competition level
 */
function determineCompetitionLevel(competitorsCount, avgInstalls, avgRating) {
  if (competitorsCount >= 20 && avgInstalls >= 1000000 && avgRating >= 4.0) {
    return "Very High";
  }
  if (competitorsCount >= 10 && avgInstalls >= 500000 && avgRating >= 3.5) {
    return "High";
  }
  if (competitorsCount >= 5 && avgInstalls >= 100000) {
    return "Medium";
  }
  if (competitorsCount >= 1) {
    return "Low";
  }
  return "None";
}

/**
 * Determine the market maturity
 * @param {number} avgAgeInDays - Average age in days
 * @param {number} avgInstalls - Average installs
 * @returns {string} - Market maturity
 */
function determineMarketMaturity(avgAgeInDays, avgInstalls) {
  if (avgAgeInDays >= 1460 || avgInstalls >= 1000000) {
    return "Mature";
  }
  if (avgAgeInDays >= 730 || avgInstalls >= 100000) {
    return "Established";
  }
  if (avgAgeInDays >= 365 || avgInstalls >= 10000) {
    return "Growing";
  }
  return "New";
}
