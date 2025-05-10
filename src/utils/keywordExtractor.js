/**
 * Utility to extract keywords from an app idea
 */

/**
 * Extract keywords from an app idea description
 * @param {string} idea - The app idea description
 * @returns {Array} - Array of extracted keywords
 */
exports.extractKeywords = (idea) => {
  if (!idea) return [];

  // Convert to lowercase
  const text = idea.toLowerCase();

  // Remove special characters and extra spaces
  const cleanText = text
    .replace(/[^\w\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Split into words
  const words = cleanText.split(" ");

  // Remove common stop words
  const stopWords = [
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "in",
    "on",
    "at",
    "to",
    "for",
    "with",
    "by",
    "about",
    "against",
    "between",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "from",
    "up",
    "down",
    "of",
    "off",
    "over",
    "under",
    "again",
    "further",
    "then",
    "once",
    "here",
    "there",
    "when",
    "where",
    "why",
    "how",
    "all",
    "any",
    "both",
    "each",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "can",
    "will",
    "just",
    "should",
    "now",
    "i",
    "me",
    "my",
    "myself",
    "we",
    "our",
    "ours",
    "ourselves",
    "you",
    "your",
    "yours",
    "yourself",
    "yourselves",
    "he",
    "him",
    "his",
    "himself",
    "she",
    "her",
    "hers",
    "herself",
    "it",
    "its",
    "itself",
    "they",
    "them",
    "their",
    "theirs",
    "themselves",
    "what",
    "which",
    "who",
    "whom",
    "this",
    "that",
    "these",
    "those",
    "am",
    "would",
    "could",
    "should",
    "app",
    "make",
    "create",
    "build",
    "application",
  ];

  const filteredWords = words.filter(
    (word) => word.length > 2 && !stopWords.includes(word) && !parseInt(word)
  );

  // Extract common phrases (bigrams)
  const phrases = [];
  for (let i = 0; i < words.length - 1; i++) {
    if (!stopWords.includes(words[i]) && !stopWords.includes(words[i + 1])) {
      const phrase = words[i] + " " + words[i + 1];
      if (phrase.length > 5) {
        phrases.push(phrase);
      }
    }
  }

  // Combine individual words and phrases, removing duplicates
  const rawKeywords = [...new Set([...filteredWords, ...phrases])];

  // Limit to most relevant keywords (up to 6)
  return rawKeywords.slice(0, 6);
};
