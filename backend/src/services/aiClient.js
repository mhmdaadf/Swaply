require('dotenv').config();
/**
 * Centralized AI Client v2 (Groq + OpenAI + Smart Demo Fallback)
 *
 * Primary: Groq (LPU Inference - Extremely fast, free tier available)
 * Secondary: OpenAI (GPT-4o-mini or GPT-4o)
 * Fallback: Heuristic Engine (Deterministic NLP for core functionality)
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1';

// --------------- In-memory TTL cache ---------------
class TTLCache {
  constructor(ttlMs = 30 * 60 * 1000, maxSize = 500) {
    this._map = new Map();
    this._ttl = ttlMs;
    this._max = maxSize;
  }
  get(key) {
    const entry = this._map.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.exp) { this._map.delete(key); return undefined; }
    return entry.val;
  }
  set(key, val) {
    if (this._map.size >= this._max) {
      const oldest = this._map.keys().next().value;
      this._map.delete(oldest);
    }
    this._map.set(key, { val, exp: Date.now() + this._ttl });
  }
  clear() {
    this._map.clear();
  }
  get size() {
    return this._map.size;
  }
}

const chatCache = new TTLCache(30 * 60 * 1000, 300);

// --------------- Helpers ---------------

function getApiKey() {
  return process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
}

function getBaseUrl() {
  if (process.env.GROQ_API_KEY) return GROQ_API_URL;
  if (process.env.OPENAI_API_KEY) return 'https://api.openai.com/v1';
  return null;
}

function getModel() {
  if (process.env.GROQ_API_KEY) return process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

function getProviderName() {
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.OPENAI_API_KEY) return 'openai';
  return 'none';
}

// --------------- Heuristic Engine (Deterministic NLP) ---------------
/**
 * When no API key is found, this engine provides local word-overlap
 * similarity and template reasoning.
 */
const HeuristicEngine = {
  calculateSimilarity(s1, s2) {
    const words1 = new Set(s1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    const words2 = new Set(s2.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return union.size === 0 ? 0 : intersection.size / union.size;
  },

  generateReasoning(params) {
    const { title, category, condition, originalPrice } = params;
    const reasons = [
      `${category} items like "${title}" tend to hold ~${Math.round(Math.random() * 20 + 40)}% value in ${condition} condition.`,
      `Market demand for ${category} is currently stable, supporting a fair swap value for "${title}".`,
      `Based on the original price of $${originalPrice}, this ${category} item accounts for standard depreciation in ${condition} condition.`,
      `The "${condition}" condition of this ${category} item "${title}" was a key factor in adjusting its swap points.`,
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  },
};

// --------------- Public API ---------------

/**
 * Chat Completions (Groq / OpenAI)
 * @param {string} systemPrompt - System-level instruction
 * @param {string} userPrompt - User-level message
 * @param {object} opts - { cacheKey?: string, maxTokens?: number }
 * @returns {string|null} - AI response text, or null on failure
 */
async function chatCompletion(systemPrompt, userPrompt, opts = {}) {
  const apiKey = getApiKey();
  const baseUrl = getBaseUrl();
  const { cacheKey, maxTokens = 400 } = opts;

  if (cacheKey) {
    const cached = chatCache.get(cacheKey);
    if (cached) return cached;
  }

  if (apiKey && baseUrl) {
    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: getModel(),
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: maxTokens,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (cacheKey && reply) chatCache.set(cacheKey, reply);
        return reply;
      } else {
        const errBody = await res.text().catch(() => '');
        console.error(`[aiClient] API error ${res.status}:`, errBody.slice(0, 200));
      }
    } catch (err) {
      console.error('[aiClient] AI call failed:', err.message);
    }
  }

  return null;
}

module.exports = {
  chatCompletion,
  HeuristicEngine,
  hasKey: () => !!getApiKey(),
  getProviderName,
  getModel,
};
