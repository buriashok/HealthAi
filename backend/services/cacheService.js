import { LRUCache } from 'lru-cache';
import crypto from 'crypto';

// ─── Chat Response Cache (1 hour TTL) ────────────────────────────
const chatCache = new LRUCache({
  max: 200,                         // Max 200 cached responses
  ttl: 1000 * 60 * 60,              // 1 hour
  allowStale: false,
  updateAgeOnGet: true,
});

// ─── Disease Info Cache (24 hour TTL) ────────────────────────────
const diseaseCache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 60 * 24,         // 24 hours
  allowStale: true,
});

// ─── Common Symptom Combos (pre-seeded, longer TTL) ──────────────
const commonSymptomCache = new LRUCache({
  max: 50,
  ttl: 1000 * 60 * 60 * 6,          // 6 hours
});

/**
 * Generate a cache key from message content.
 * Normalizes text to increase cache hit rate.
 */
const generateCacheKey = (messages, prefix = 'chat') => {
  // Use last 3 messages for context-aware caching
  const recentMessages = messages.slice(-3);
  const normalized = recentMessages
    .map(m => `${m.role || m.sender}:${(m.content || m.text || '').toLowerCase().trim()}`)
    .join('|');

  const hash = crypto.createHash('md5').update(normalized).digest('hex');
  return `${prefix}:${hash}`;
};

/**
 * Get cached chat response.
 */
export const getCachedResponse = (messages) => {
  const key = generateCacheKey(messages);
  return chatCache.get(key) || null;
};

/**
 * Cache a chat response.
 */
export const setCachedResponse = (messages, response) => {
  const key = generateCacheKey(messages);
  chatCache.set(key, response);
};

/**
 * Get cached symptom analysis.
 */
export const getCachedAnalysis = (messages) => {
  const key = generateCacheKey(messages, 'analysis');
  return commonSymptomCache.get(key) || null;
};

/**
 * Cache a symptom analysis result.
 */
export const setCachedAnalysis = (messages, analysis) => {
  const key = generateCacheKey(messages, 'analysis');
  commonSymptomCache.set(key, analysis);
};

/**
 * Get cache stats for monitoring.
 */
export const getCacheStats = () => ({
  chat: { size: chatCache.size, maxSize: chatCache.max },
  disease: { size: diseaseCache.size, maxSize: diseaseCache.max },
  symptoms: { size: commonSymptomCache.size, maxSize: commonSymptomCache.max },
});

/**
 * Clear all caches.
 */
export const clearAllCaches = () => {
  chatCache.clear();
  diseaseCache.clear();
  commonSymptomCache.clear();
};

export default {
  getCachedResponse,
  setCachedResponse,
  getCachedAnalysis,
  setCachedAnalysis,
  getCacheStats,
  clearAllCaches,
};
