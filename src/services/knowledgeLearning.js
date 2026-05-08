import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { searchAnswer, addToCacheAndRebuild } from './aiSearch';

/**
 * Stop words to filter out from keywords
 * Common words that don't add semantic value
 */
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by',
  'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not', 'of',
  'on', 'or', 'such', 'that', 'the', 'to', 'up', 'with',
  'what', 'when', 'where', 'which', 'who', 'why', 'how', 'do', 'does',
  'did', 'have', 'has', 'had', 'you', 'your', 'me', 'my', 'he', 'she',
  'it', 'we', 'they', 'them', 'their', 'this', 'that', 'these', 'those',
  'am', 'was', 'were', 'been', 'being', 'from', 'just', 'should', 'would',
  'could', 'might', 'must', 'can', 'may', 'will', 'shall', 'about',
  // Add Azerbaijani stop words if needed
  'və', 'bu', 'o', 'var', 'yoxdur',
]);

/**
 * Normalize text for consistent processing
 * Same normalization as aiSearch.js
 */
const normalizeText = (text) => {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,!?;:'"()\[\]{}-]/g, '');
};

/**
 * Generate meaningful keywords from text
 * Filters stop words, short tokens, and extracts n-grams
 *
 * @param {string} text - Combined text from question and answer
 * @returns {Array<string>} Array of meaningful keywords
 */
export const generateKeywords = (text) => {
  if (!text) return [];

  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/).filter((word) => word.length > 0);

  // Filter: remove stop words and very short tokens
  const meaningfulWords = words.filter(
    (word) => word.length >= 3 && !STOP_WORDS.has(word)
  );

  // Remove duplicates while preserving order
  const uniqueKeywords = Array.from(new Set(meaningfulWords));

  // Extract 2-3 word n-grams (bigrams and trigrams)
  const ngrams = [];
  for (let i = 0; i < words.length - 1; i++) {
    // Bigram: 2-word phrase
    const bigram = [words[i], words[i + 1]].join(' ');
    if (bigram.length >= 5 && !STOP_WORDS.has(words[i])) {
      ngrams.push(bigram);
    }

    // Trigram: 3-word phrase
    if (i < words.length - 2) {
      const trigram = [words[i], words[i + 1], words[i + 2]].join(' ');
      if (
        trigram.length >= 8 &&
        !STOP_WORDS.has(words[i]) &&
        !STOP_WORDS.has(words[i + 1])
      ) {
        ngrams.push(trigram);
      }
    }
  }

  // Combine single words and n-grams, limit to top keywords
  const allKeywords = [...uniqueKeywords, ...ngrams];
  const dedupedKeywords = Array.from(new Set(allKeywords));

  return dedupedKeywords.slice(0, 15); // Limit to 15 keywords
};

/**
 * Check if a similar question already exists in knowledge base
 * Uses Fuse.js search to find potential duplicates
 *
 * @param {string} newQuestion - Question to check for duplicates
 * @returns {Promise<Object|null>} Matching document or null
 */
export const checkForDuplicates = async (newQuestion) => {
  try {
    const result = await searchAnswer(newQuestion);
    // If we find a match with reasonable score, consider it a potential duplicate
    // Fuse.js score is 0-1, lower is better; threshold of 0.3 means fairly similar
    if (result && result.score <= 0.3) {
      return result;
    }
    return null;
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return null;
  }
};

/**
 * Save new knowledge entry to Firestore
 * Creates document in knowledge_base collection with auto-generated keywords
 *
 * @param {string} question - User's original question
 * @param {string} answer - Admin's provided answer
 * @param {string} userId - Current user's UID
 * @returns {Promise<Object>} { success, id, error, duplicate }
 */
export const saveNewKnowledge = async (question, answer, userId) => {
  try {
    // Validate inputs
    if (!question || !question.trim()) {
      return {
        success: false,
        error: 'Question cannot be empty',
        id: null,
        duplicate: null,
      };
    }

    if (!answer || !answer.trim()) {
      return {
        success: false,
        error: 'Answer cannot be empty',
        id: null,
        duplicate: null,
      };
    }

    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
        id: null,
        duplicate: null,
      };
    }

    // Check for duplicates before saving
    const duplicateCheck = await checkForDuplicates(question);

    // Generate keywords from combined question and answer
    const keywords = generateKeywords(`${question} ${answer}`);

    // Create Firestore document
    const docRef = await addDoc(collection(db, 'knowledge_base'), {
      question: question.trim(),
      answer: answer.trim(),
      keywords,
      category: 'User Contributed',
      createdAt: serverTimestamp(),
      createdBy: userId,
    });

    return {
      success: true,
      id: docRef.id,
      error: null,
      duplicate: duplicateCheck, // Include duplicate warning (if any)
    };
  } catch (error) {
    console.error('Error saving knowledge:', error);
    return {
      success: false,
      error: `Failed to save: ${error.message}`,
      id: null,
      duplicate: null,
    };
  }
};

/**
 * Update local cache with new knowledge entry
 * This is called from AiChat after a successful save
 * Integrates with aiSearch to rebuild Fuse.js index
 *
 * @param {Object} newEntry - New knowledge document from Firestore
 */
export const updateLocalCache = async (newEntry) => {
  try {
    // Call the cache update function from aiSearch directly
    await addToCacheAndRebuild(newEntry);
  } catch (error) {
    console.error('Error updating local cache:', error);
  }
};
