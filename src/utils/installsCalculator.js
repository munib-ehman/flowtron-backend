/**
 * Utility to calculate install estimates
 */

/**
 * Calculate estimated last 30 days installs based on total installs and app age
 * @param {number} totalInstalls - Total number of installs
 * @param {string} releasedDate - Release date of the app
 * @returns {number} - Estimated last 30 days installs
 */
exports.calculateLast30DaysInstalls = (totalInstalls, releasedDate) => {
  // If no valid data, return 0
  if (!totalInstalls || !releasedDate) return 0;

  try {
    // Calculate app age in days
    const releaseDate = new Date(releasedDate);
    const now = new Date();
    const ageInDays = Math.max(
      1,
      Math.floor((now - releaseDate) / (1000 * 60 * 60 * 24))
    );

    // If app is newer than 30 days, we calculate based on its age
    if (ageInDays < 30) {
      return totalInstalls;
    }

    // Apply a growth curve adjustment based on app age
    // Recent installs tend to make up a different percentage of total installs based on app age
    let last30DaysPercentage = 0;

    if (ageInDays < 90) {
      // Very new apps (1-3 months) tend to have most of their installs in last 30 days
      last30DaysPercentage = 0.6; // 60% of total installs in last 30 days
    } else if (ageInDays < 180) {
      // Growing apps (3-6 months)
      last30DaysPercentage = 0.4; // 40% of total installs in last 30 days
    } else if (ageInDays < 365) {
      // Established apps (6-12 months)
      last30DaysPercentage = 0.2; // 20% of total installs in last 30 days
    } else if (ageInDays < 730) {
      // Mature apps (1-2 years)
      last30DaysPercentage = 0.1; // 10% of total installs in last 30 days
    } else {
      // Very mature apps (2+ years)
      last30DaysPercentage = 0.05; // 5% of total installs in last 30 days
    }

    // Adjust percentage based on total install count
    // More popular apps tend to have more consistent install rates
    if (totalInstalls > 10000000) {
      // 10M+
      last30DaysPercentage *= 1.2; // 20% boost for very popular apps
    } else if (totalInstalls < 10000) {
      // Less than 10K
      last30DaysPercentage *= 0.8; // 20% reduction for less popular apps
    }

    // Calculate and round to nearest integer
    return Math.round(totalInstalls * last30DaysPercentage);
  } catch (error) {
    // Return a reasonable default if calculation fails
    return Math.round(totalInstalls * 0.1); // Assume 10% of total installs in last 30 days
  }
};
