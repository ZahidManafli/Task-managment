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
 * Generic/weak words that should NOT drive a match on their own.
 * These are words common to many questions regardless of topic.
 */
const WEAK_TOKENS = new Set([
  // English generic
  'problem', 'problemi', 'issue', 'error', 'help', 'fix', 'not', 'working',
  'work', 'cant', 'cannot', 'doesnt', 'isnt', 'why', 'how', 'what', 'when',
  'where', 'which', 'who', 'please', 'need', 'want', 'know', 'get', 'use',
  'check', 'yoxlayın', 'yoxla', 'edin', 'etmek', 'var', 'yoxdur',
  // Azerbaijani generic
  'problemi', 'xeta', 'sehv', 'etmək', 'lazim', 'lazımdır', 'necə', 'nece',
  'nədir', 'nedir', 'harda', 'harada', 'niyə', 'niye', 'ola', 'bilər', 'bilir',
  'olan', 'olmur', 'olur', 'etmir', 'edir',
]);

/**
 * Load knowledge base from Firestore
 * Caches result to minimize database calls
 */
const loadKnowledgeBase = async () => {
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
  const fuseOptions = {
    keys: [
      { name: 'searchText', weight: 2 },
      { name: 'question', weight: 1 },
    ],
    // Tightened from 0.5 → 0.3: requires a much closer match before
    // Fuse declares success. This stops "rj45 problemi" from matching
    // "Grandstream səs yoxdur" just because "problemi" overlaps.
    threshold: 0.3,
    distance: 100,
    minMatchCharLength: 3,
    includeScore: true,
  };

  fuseInstance = new Fuse(knowledge, fuseOptions);
};

/**
 * Split a normalised query into (strong, weak) token sets.
 * Strong tokens are domain-specific words that actually identify the topic.
 * Weak tokens (problem, xeta, etc.) are generic and should NOT drive a match.
 */
const classifyTokens = (tokens) => {
  const strong = tokens.filter((t) => t.length >= 3 && !WEAK_TOKENS.has(t));
  const weak   = tokens.filter((t) => t.length >= 3 &&  WEAK_TOKENS.has(t));
  return { strong, weak };
};

/**
 * Compute a weighted overlap score between query tokens and a knowledge item.
 *
 * Scoring rules:
 *  - Strong token hit in keywords  → 3 points  (most specific signal)
 *  - Strong token hit in question  → 2 points
 *  - Strong token hit in category  → 1.5 points
 *  - Strong token hit in searchText → 1 point
 *  - Weak token hit anywhere       → 0.2 points (almost negligible)
 *  - n-gram phrase match           → +1 bonus
 *
 * Final score is normalised by the number of strong tokens (or 1 if none),
 * so a query with only weak tokens cannot manufacture a high score.
 */
const computeWeightedScore = (strong, weak, item) => {
  const haystack   = item.searchText || '';
  const question   = normalizeText(item.question);
  const category   = normalizeText(item.category);
  const keywords   = Array.isArray(item.keywords) ? item.keywords : [];

  let points = 0;

  for (const token of strong) {
    if (keywords.some((k) => k === token || k.includes(token) || token.includes(k))) {
      points += 3;
    } else if (question.includes(token)) {
      points += 2;
    } else if (category.includes(token)) {
      points += 1.5;
    } else if (haystack.includes(token)) {
      points += 1;
    } else if (token.length > 3 && haystack.includes(token.slice(0, 4))) {
      // Prefix match — partial credit only
      points += 0.4;
    }
  }

  for (const token of weak) {
    if (haystack.includes(token) || keywords.some((k) => k.includes(token))) {
      points += 0.2; // Weak tokens contribute almost nothing
    }
  }

  // n-gram bonus: if the full strong phrase appears verbatim
  if (strong.length > 1) {
    const phrase = strong.join(' ');
    if (haystack.includes(phrase) || question.includes(phrase)) {
      points += 1;
    }
  }

  // Normalise: divide by strong token count so weak-only queries stay near 0
  const denominator = strong.length || 1;
  return points / denominator;
};

/**
 * Search for an answer based on user query.
 *
 * Strategy:
 *  1. Fuse.js fuzzy search (score ≤ 0.25, tight) for typo-tolerant exact-ish matches.
 *  2. Weighted token overlap fallback that strongly favours specific tokens
 *     and almost ignores generic words like "problemi".
 */
export const searchAnswer = async (query) => {
  if (!query || query.trim().length === 0) return null;

  try {
    if (!knowledgeCache) await loadKnowledgeBase();

    const normalizedQuery = normalizeText(query);

    // ── Step 1: Fuse.js (tight threshold) ──────────────────────────────────
    if (fuseInstance && fuseInstance.getIndex().docs.length > 0) {
      const results = fuseInstance.search(normalizedQuery);
      if (results.length > 0) {
        const best = results[0];
        // Accept only high-confidence Fuse matches (≤ 0.25)
        if (typeof best.score === 'number' && best.score <= 0.25) {
          return {
            answer:   best.item.answer,
            question: best.item.question,
            score:    best.score,
            category: best.item.category,
            id:       best.item.id,
          };
        }
      }
    }

    // ── Step 2: Weighted token overlap ─────────────────────────────────────
    const queryTokens = normalizedQuery.split(' ').filter(Boolean);
    if (queryTokens.length === 0) return null;

    const { strong, weak } = classifyTokens(queryTokens);

    // If the query contains NO strong tokens at all (e.g. "problem yoxdur")
    // we cannot reliably identify a topic — bail out early.
    if (strong.length === 0) {
      console.warn('Query has no strong tokens; refusing to guess:', query);
      return null;
    }

    let bestCandidate = null;
    let bestScore     = 0;

    for (const item of knowledgeCache) {
      const score = computeWeightedScore(strong, weak, item);
      if (score > bestScore) {
        bestScore     = score;
        bestCandidate = item;
      }
    }

    // Require at least 50 % of strong tokens to match before accepting
    // (normalised score ≥ 0.5 means on average ≥1 point per strong token,
    //  i.e. at least a searchText-level hit for every token).
    const FALLBACK_THRESHOLD = 0.5;
    if (bestCandidate && bestScore >= FALLBACK_THRESHOLD) {
      return {
        answer:   bestCandidate.answer,
        question: bestCandidate.question,
        score:    bestScore,
        category: bestCandidate.category,
        id:       bestCandidate.id,
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
 */
export const refreshKnowledgeBase = async () => {
  knowledgeCache = null;
  fuseInstance   = null;
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
      knowledge.push({ id: doc.id, ...doc.data() });
    });
    return knowledge;
  } catch (error) {
    console.error('Error fetching all knowledge:', error);
    return [];
  }
};

/**
 * Initialize knowledge base on app load
 */
export const initializeAiSearch = async () => {
  try {
    await loadKnowledgeBase();
    console.log('AI Search service initialized');
  } catch (error) {
    console.error('Error initializing AI Search:', error);
  }
};

/**
 * Get the current knowledge cache
 */
export const getKnowledgeCache = () => knowledgeCache || [];

/**
 * Add new entry to cache and rebuild Fuse.js index
 */
export const addToCacheAndRebuild = async (newEntry) => {
  try {
    if (!newEntry || !newEntry.id) {
      console.error('Invalid entry for cache update');
      return;
    }

    const normalizedQuestion = normalizeText(newEntry.question || '');
    const normalizedKeywords = (newEntry.keywords || []).map(normalizeText);
    const normalizedCategory = normalizeText(newEntry.category || '');

    const normalizedEntry = {
      id:       newEntry.id,
      question: newEntry.question || '',
      answer:   newEntry.answer   || '',
      keywords: normalizedKeywords,
      category: newEntry.category || '',
      searchText: normalizeText(
        [normalizedQuestion, normalizedKeywords.join(' '), normalizedCategory]
          .filter(Boolean)
          .join(' ')
      ),
      createdAt: newEntry.createdAt,
      createdBy: newEntry.createdBy,
    };

    if (!knowledgeCache) knowledgeCache = [];
    knowledgeCache.push(normalizedEntry);
    initializeFuse(knowledgeCache);

    console.log('Knowledge cache updated and Fuse.js index rebuilt');
  } catch (error) {
    console.error('Error updating cache:', error);
  }
};