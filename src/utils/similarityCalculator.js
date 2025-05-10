/**
 * Utility to calculate similarity between app idea and existing apps
 */

/**
 * Calculate Jaccard similarity coefficient between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity coefficient (0-1)
 */
const jaccardSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;

  // Tokenize strings into sets of words
  const set1 = new Set(
    str1
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((s) => s.length > 2)
  );
  const set2 = new Set(
    str2
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((s) => s.length > 2)
  );

  // Find intersection and union
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  // Calculate Jaccard coefficient
  return union.size === 0 ? 0 : intersection.size / union.size;
};

/**
 * Calculate keyword match score between app idea keywords and app title/description
 * @param {Array} keywords - Array of keywords from the app idea
 * @param {string} title - App title
 * @param {string} description - App description
 * @returns {number} - Keyword match score (0-1)
 */
const keywordMatchScore = (keywords, title, description) => {
  if (!keywords || keywords.length === 0 || (!title && !description)) return 0;

  const titleDesc = (title + " " + (description || "")).toLowerCase();
  let matches = 0;

  keywords.forEach((keyword) => {
    if (titleDesc.includes(keyword.toLowerCase())) {
      matches++;
    }
  });

  return keywords.length === 0 ? 0 : matches / keywords.length;
};

/**
 * Calculate genre match score
 * @param {string} ideaGenre - Genre from app idea (if any)
 * @param {string} appGenre - App genre
 * @returns {number} - Genre match score (0-1)
 */
const genreMatchScore = (ideaGenre, appGenre) => {
  if (!ideaGenre || !appGenre) return 0.5; // Neutral if no genre information

  return ideaGenre.toLowerCase() === appGenre.toLowerCase() ? 1 : 0;
};

/**
 * Calculate overall similarity index between app idea and existing app
 * @param {object} appIdea - App idea object with title, description, keywords
 * @param {object} app - Existing app object
 * @returns {number} - Similarity index (0-100)
 */
exports.calculateSimilarityIndex = (appIdea, app) => {
  if (!appIdea || !app) return 0;

  // Calculate text similarity between idea and app title/description
  const textSimilarity = jaccardSimilarity(
    appIdea.idea,
    app.title + " " + (app.summary || "") + " " + (app.description || "")
  );

  // Calculate keyword match score
  const keywordScore = keywordMatchScore(
    appIdea.keywords,
    app.title,
    (app.summary || "") + " " + (app.description || "")
  );

  // Calculate genre match score (if available)
  const genreScore = genreMatchScore(appIdea.genre, app.genre);

  // Weight the scores (text similarity: 50%, keyword matches: 40%, genre: 10%)
  const weightedScore =
    textSimilarity * 0.5 + keywordScore * 0.4 + genreScore * 0.1;

  // Convert to 0-100 scale and round to nearest integer
  return Math.round(weightedScore * 100);
};
