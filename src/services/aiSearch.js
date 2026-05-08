import Fuse from 'fuse.js';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Cache for knowledge base to avoid repeated Firestore calls
let knowledgeCache = null;
let fuseInstance = null;

/**
 * Normalize text for better search matching
 * - Convert to lowercase
 * - Trim whitespace
 * - Remove extra spaces
 */
const normalizeText = (text) => {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,!?;:'"()\[\]{}-]/g, ''); // Remove punctuation
};

/**
 * Load knowledge base from Firestore
 * Caches result to minimize database calls
 */
const loadKnowledgeBase = async () => {
  // Return cached data if available
  if (knowledgeCache && knowledgeCache.length > 0) {
    return knowledgeCache;
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'knowledge_base'));
    const knowledge = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const normalizedQuestion = normalizeText(data.question || '');
      const normalizedKeywords = (data.keywords || []).map(normalizeText);
      const normalizedCategory = normalizeText(data.category || '');

      // Normalize keywords and question for search
      knowledge.push({
        id: doc.id,
        question: data.question || '',
        answer: data.answer || '',
        keywords: normalizedKeywords,
        category: data.category || '',
        searchText: normalizeText(
          [normalizedQuestion, normalizedKeywords.join(' '), normalizedCategory]
            .filter(Boolean)
            .join(' ')
        ),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        createdBy: data.createdBy,
      });
    });

    // Cache the knowledge base
    knowledgeCache = knowledge;
    initializeFuse(knowledge);

    return knowledge;
  } catch (error) {
    console.error('Error loading knowledge base:', error);
    return [];
  }
};

/**
 * Initialize Fuse.js instance with knowledge base
 */
const initializeFuse = (knowledge) => {
  // Fuse.js configuration with moderate fuzzy matching (0.5 threshold)
  const fuseOptions = {
    keys: [
      { name: 'searchText', weight: 2 }, // Combined search field weighted higher
      { name: 'question', weight: 1 },
    ],
    threshold: 0.5, // Moderate matching - catches typos without too many false positives
    distance: 100, // Allow matches up to 100 characters away
    minMatchCharLength: 2, // Minimum 2 characters to match
    includeScore: true,
  };

  fuseInstance = new Fuse(knowledge, fuseOptions);
};

/**
 * Search for an answer based on user query
 * Uses fuzzy matching to find the best related question
 * Returns the best matching answer or null if no match found
 */
export const searchAnswer = async (query) => {
  if (!query || query.trim().length === 0) {
    return null;
  }

  try {
    // Load knowledge base if not cached
    if (!knowledgeCache) {
      await loadKnowledgeBase();
    }

    // Normalize the query
    const normalizedQuery = normalizeText(query);

    // Perform fuzzy search
    if (!fuseInstance || fuseInstance.getIndex().docs.length === 0) {
      return null;
    }

    const results = fuseInstance.search(normalizedQuery);

    // Return best match if found
    if (results && results.length > 0) {
      const bestMatch = results[0];
      return {
        answer: bestMatch.item.answer,
        question: bestMatch.item.question,
        score: bestMatch.score,
        category: bestMatch.item.category,
        id: bestMatch.item.id,
      };
    }

    // Fallback: token-overlap match for short support phrases like "grandstream fwd problem"
    const queryTokens = normalizedQuery.split(' ').filter(Boolean);
    let fallbackMatch = null;
    let fallbackScore = 0;

    for (const item of knowledgeCache) {
      const haystack = item.searchText || '';
      const tokenHits = queryTokens.filter(
        (token) => haystack.includes(token) || token.length > 2 && haystack.includes(token.slice(0, 4))
      ).length;
      const queryHit = haystack.includes(normalizedQuery) ? 2 : 0;
      const score = tokenHits + queryHit;

      if (score > fallbackScore) {
        fallbackScore = score;
        fallbackMatch = item;
      }
    }

    if (fallbackMatch && fallbackScore > 0) {
      return {
        answer: fallbackMatch.answer,
        question: fallbackMatch.question,
        score: fallbackScore,
        category: fallbackMatch.category,
        id: fallbackMatch.id,
      };
    }

    return null;
  } catch (error) {
    console.error('Error searching for answer:', error);
    return null;
  }
};

/**
 * Refresh the knowledge base cache
 * Call this after adding/updating/deleting knowledge entries
 */
export const refreshKnowledgeBase = async () => {
  knowledgeCache = null;
  fuseInstance = null;
  await loadKnowledgeBase();
};

/**
 * Get all knowledge entries (for admin panel)
 */
export const getAllKnowledge = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'knowledge_base'));
    const knowledge = [];

    querySnapshot.forEach((doc) => {
      knowledge.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return knowledge;
  } catch (error) {
    console.error('Error fetching all knowledge:', error);
    return [];
  }
};

/**
 * Initialize knowledge base on app load
 * Should be called once at app startup
 */
export const initializeAiSearch = async () => {
  try {
    await loadKnowledgeBase();
    console.log('AI Search service initialized');
  } catch (error) {
    console.error('Error initializing AI Search:', error);
  }
};
