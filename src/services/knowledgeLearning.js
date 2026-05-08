import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { searchAnswer, addToCacheAndRebuild } from './aiSearch';

/**
 * Stop words to filter out from auto-generated keywords.
 *
 * IMPORTANT: Generic words like "problemi", "xeta", "issue" are included here
 * because they appear in almost every question and add no topic signal.
 * If they were kept as keywords they would cause cross-topic false matches
 * (e.g. "rj45 problemi" matching "Grandstream səs yoxdur" just because
 * both share the keyword "problemi").
 */
const STOP_WORDS = new Set([
  // ── English function words ──────────────────────────────────────────────
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by',
  'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not', 'of',
  'on', 'or', 'such', 'that', 'the', 'to', 'up', 'with',
  'what', 'when', 'where', 'which', 'who', 'why', 'how', 'do', 'does',
  'did', 'have', 'has', 'had', 'you', 'your', 'me', 'my', 'he', 'she',
  'we', 'they', 'them', 'their', 'this', 'these', 'those',
  'am', 'was', 'were', 'been', 'being', 'from', 'just', 'should', 'would',
  'could', 'might', 'must', 'can', 'may', 'will', 'shall', 'about',

  // ── Generic English tech/support words (topic-neutral) ─────────────────
  // These words appear in almost every IT question and must NOT be keywords,
  // otherwise every entry would match every other entry.
  'problem', 'problems', 'issue', 'issues', 'error', 'errors',
  'help', 'fix', 'fixing', 'check', 'checking', 'not', 'working',
  'work', 'cant', 'cannot', 'doesnt', 'isnt', 'need', 'want',
  'know', 'get', 'use', 'using', 'please', 'try', 'trying',

  // ── Azerbaijani function words ──────────────────────────────────────────
  'və', 'bu', 'o', 'var', 'yoxdur', 'da', 'də', 'ki', 'bir', 'ile',
  'ilə', 'üçün', 'ucun', 'olan', 'olan', 'edir', 'etmir', 'olur',
  'olmur', 'ola', 'bilər', 'bilir', 'necə', 'nece', 'nədir', 'nedir',
  'harda', 'harada', 'niyə', 'niye', 'lazım', 'lazim', 'lazımdır',

  // ── Generic Azerbaijani tech/support words (topic-neutral) ─────────────
  // Same logic as English above — these appear in every question.
  'problemi', 'problem', 'xeta', 'xəta', 'sehv', 'səhv',
  'yoxla', 'yoxlayın', 'edin', 'etmek', 'etmək',
]);

/**
 * Normalize text for consistent processing (mirrors aiSearch.js)
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
 * Generate meaningful keywords from text.
 *
 * Only topic-specific words survive; generic / stop words are stripped.
 * This ensures the keyword index is precise and does not cause
 * cross-topic false positives during search.
 *
 * @param {string} text - Combined text from question and answer
 * @returns {Array<string>} Array of meaningful keywords (max 15)
 */
export const generateKeywords = (text) => {
  if (!text) return [];

  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/).filter((word) => word.length > 0);

  // Keep only topic-specific words: length ≥ 3 and not a stop word
  const meaningfulWords = words.filter(
    (word) => word.length >= 3 && !STOP_WORDS.has(word)
  );

  const uniqueKeywords = Array.from(new Set(meaningfulWords));

  // Build bigrams and trigrams from meaningful words only
  // (using raw words[] would risk phrases like "problemi yoxlayın" as keywords)
  const ngrams = [];
  for (let i = 0; i < uniqueKeywords.length - 1; i++) {
    const bigram = [uniqueKeywords[i], uniqueKeywords[i + 1]].join(' ');
    if (bigram.length >= 5) {
      ngrams.push(bigram);
    }

    if (i < uniqueKeywords.length - 2) {
      const trigram = [uniqueKeywords[i], uniqueKeywords[i + 1], uniqueKeywords[i + 2]].join(' ');
      if (trigram.length >= 8) {
        ngrams.push(trigram);
      }
    }
  }

  const allKeywords   = [...uniqueKeywords, ...ngrams];
  const dedupedKeywords = Array.from(new Set(allKeywords));

  return dedupedKeywords.slice(0, 15);
};

/**
 * Check if a similar question already exists in knowledge base.
 *
 * @param {string} newQuestion
 * @returns {Promise<Object|null>}
 */
export const checkForDuplicates = async (newQuestion) => {
  try {
    const result = await searchAnswer(newQuestion);
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
 * Save new knowledge entry to Firestore.
 *
 * @param {string} question
 * @param {string} answer
 * @param {string} userId
 * @returns {Promise<Object>} { success, id, error, duplicate }
 */
export const saveNewKnowledge = async (question, answer, userId) => {
  try {
    if (!question || !question.trim()) {
      return { success: false, error: 'Question cannot be empty', id: null, duplicate: null };
    }
    if (!answer || !answer.trim()) {
      return { success: false, error: 'Answer cannot be empty', id: null, duplicate: null };
    }
    if (!userId) {
      return { success: false, error: 'User ID is required', id: null, duplicate: null };
    }

    const duplicateCheck = await checkForDuplicates(question);

    // Generate keywords (generic words like "problemi" are already filtered)
    const keywords = generateKeywords(`${question} ${answer}`);

    const docRef = await addDoc(collection(db, 'knowledge_base'), {
      question:  question.trim(),
      answer:    answer.trim(),
      keywords,
      category:  'User Contributed',
      createdAt: serverTimestamp(),
      createdBy: userId,
    });

    return { success: true, id: docRef.id, error: null, duplicate: duplicateCheck };
  } catch (error) {
    console.error('Error saving knowledge:', error);
    return { success: false, error: `Failed to save: ${error.message}`, id: null, duplicate: null };
  }
};

/**
 * Update local cache with new knowledge entry.
 *
 * @param {Object} newEntry
 */
export const updateLocalCache = async (newEntry) => {
  try {
    await addToCacheAndRebuild(newEntry);
  } catch (error) {
    console.error('Error updating local cache:', error);
  }
};