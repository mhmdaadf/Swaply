/**
 * Smart Matching Engine v2 — Real AI-Powered Semantic Matching
 *
 * When an AI key is present (Groq / OpenAI):
 *   1. Collects candidate users with items
 *   2. Sends item+desire pairs to the LLM for semantic relevance scoring
 *   3. LLM returns 0-10 relevance scores WITH natural-language reasoning
 *   4. Scores drive final match ranking
 *
 * Fallback (no key): Jaccard word-overlap heuristic via SmartDemo
 */

const Item = require('../models/Item');
const { chatCompletion, SmartDemo, hasKey } = require('./aiClient');

// ---------- Heuristic fallback helpers ----------

function heuristicItemScore(itemTitle, itemCategory, desiredSet) {
  const titleLower = itemTitle.toLowerCase();
  const catLower = itemCategory.toLowerCase();
  if (desiredSet.has(titleLower) || desiredSet.has(catLower)) return 10;
  for (const d of desiredSet) if (titleLower.includes(d) || d.includes(titleLower)) return 5;
  if (desiredSet.has(catLower)) return 3;
  return 0;
}

function itemToText(item) {
  return `${item.title} ${item.category} ${item.description || ''}`.toLowerCase();
}

// ---------- AI-powered semantic scoring ----------

const MATCH_SYSTEM_PROMPT = `You are a trade-matching AI for Swaply, a barter platform.
Given a list of items and a list of desired items/categories, score how well each item satisfies the desires.
Consider semantic meaning, not just keywords. "wireless headphones" should match "Bluetooth earbuds".
Respond ONLY with valid JSON — no extra text. Format:
{"scores": [{"itemId": "<id>", "score": <0-10>, "reason": "<1 sentence>"}]}`;

/**
 * Ask the LLM to score how well a set of items matches a set of desires.
 * Returns a Map<itemId, {score, reason}>.
 */
async function aiScoreItems(items, desiredSet) {
  if (items.length === 0 || desiredSet.size === 0) return new Map();

  const desiredList = [...desiredSet].join(', ');
  const itemList = items.map(i => `- ID:${i._id} | "${i.title}" (${i.category}, ${i.condition}) — ${(i.description || '').slice(0, 80)}`).join('\n');

  const userPrompt = `Desired items/categories: ${desiredList}\n\nAvailable items:\n${itemList}\n\nScore each item 0-10 on how well it satisfies the desires. 0 = irrelevant, 10 = perfect match.`;

  const cacheKey = `m:${desiredList.slice(0, 60)}:${items.map(i => i._id).join(',')}`;

  try {
    const reply = await chatCompletion(MATCH_SYSTEM_PROMPT, userPrompt, { cacheKey });
    if (reply) {
      const jsonMatch = reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const map = new Map();
        if (Array.isArray(parsed.scores)) {
          parsed.scores.forEach(s => {
            const score = Math.max(0, Math.min(10, parseInt(s.score, 10) || 0));
            map.set(String(s.itemId), { score, reason: s.reason || '' });
          });
        }
        return map;
      }
    }
  } catch (err) {
    console.error('[MatchEngine] AI scoring failed:', err.message);
  }
  return null; // null = signal to fall back
}

// ---------- Main matching function ----------

async function findMatches(userId) {
  const myItems = await Item.find({ owner: userId, status: 'available' });
  if (myItems.length === 0) return [];

  const myDesired = new Set();
  myItems.forEach(i => i.desiredItems.forEach(d => myDesired.add(d.toLowerCase())));

  const otherItems = await Item.find({ owner: { $ne: userId }, status: 'available' })
    .populate('owner', 'username trustScore profilePic');

  const ownerMap = new Map();
  otherItems.forEach(i => {
    const oid = i.owner._id.toString();
    if (!ownerMap.has(oid)) ownerMap.set(oid, { user: i.owner, items: [] });
    ownerMap.get(oid).items.push(i);
  });

  const useAI = hasKey();
  const matches = [];

  for (const [ownerId, { user, items }] of ownerMap) {
    const theirDesired = new Set();
    items.forEach(i => i.desiredItems.forEach(d => theirDesired.add(d.toLowerCase())));

    let iWantScore = 0;
    const theirMatched = [];
    let iWantReasons = [];

    let theyWantScore = 0;
    const myMatched = [];
    let theyWantReasons = [];

    if (useAI) {
      // --- AI path: LLM scores items against desires ---
      const [aiTheirScores, aiMyScores] = await Promise.all([
        aiScoreItems(items, myDesired),
        aiScoreItems(myItems, theirDesired),
      ]);

      const theirScoresValid = aiTheirScores !== null;
      const myScoresValid = aiMyScores !== null;

      items.forEach(item => {
        let score = 0;
        let reason = '';

        if (theirScoresValid) {
          const aiResult = aiTheirScores.get(String(item._id));
          if (aiResult && aiResult.score > 0) {
            score = aiResult.score;
            reason = aiResult.reason;
          }
        }
        
        // Heuristic as safety net (only if AI returned 0 or failed)
        if (score === 0) {
          const hScore = heuristicItemScore(item.title, item.category, myDesired);
          if (hScore > score) score = hScore;
        }

        if (score > 0) {
          iWantScore += score;
          theirMatched.push(item);
          if (reason) iWantReasons.push(reason);
        }
      });

      myItems.forEach(item => {
        let score = 0;
        let reason = '';

        if (myScoresValid) {
          const aiResult = aiMyScores.get(String(item._id));
          if (aiResult && aiResult.score > 0) {
            score = aiResult.score;
            reason = aiResult.reason;
          }
        }

        if (score === 0) {
          const hScore = heuristicItemScore(item.title, item.category, theirDesired);
          if (hScore > score) score = hScore;
        }

        if (score > 0) {
          theyWantScore += score;
          myMatched.push(item);
          if (reason) theyWantReasons.push(reason);
        }
      });
    } else {
      // --- Fallback: SmartDemo heuristic ---
      items.forEach(item => {
        let score = 0;
        const sim = SmartDemo.calculateSimilarity(itemToText(item), [...myDesired].join(' '));
        if (sim > 0.15) score = 10;
        else if (sim > 0.05) score = 5;

        const hScore = heuristicItemScore(item.title, item.category, myDesired);
        const finalScore = Math.max(score, hScore);
        if (finalScore > 0) { iWantScore += finalScore; theirMatched.push(item); }
      });

      myItems.forEach(item => {
        let score = 0;
        const sim = SmartDemo.calculateSimilarity(itemToText(item), [...theirDesired].join(' '));
        if (sim > 0.15) score = 10;
        else if (sim > 0.05) score = 5;

        const hScore = heuristicItemScore(item.title, item.category, theirDesired);
        const finalScore = Math.max(score, hScore);
        if (finalScore > 0) { theyWantScore += finalScore; myMatched.push(item); }
      });
    }

    if (iWantScore > 0 && theyWantScore > 0) {
      const tVal = theirMatched.reduce((s, i) => s + i.swapPointValue, 0);
      const mVal = myMatched.reduce((s, i) => s + i.swapPointValue, 0);
      const diff = Math.abs(tVal - mVal) / Math.max(tVal, mVal, 1);
      const fairness = diff < 0.2 ? 1.5 : diff < 0.5 ? 1.0 : 0.7;

      // Combine AI reasons into a single reasoning string
      const allReasons = [...iWantReasons, ...theyWantReasons];
      const reasoning = allReasons.length > 0 ? allReasons.slice(0, 3).join(' ') : null;

      matches.push({
        user,
        theirItems: theirMatched,
        myItems: myMatched,
        score: Math.round((iWantScore + theyWantScore) * fairness),
        valueFairness: fairness >= 1.5 ? 'fair' : fairness >= 1.0 ? 'moderate' : 'uneven',
        matchMethod: useAI ? 'ai' : 'demo',
        reasoning,
      });
    }
  }

  return matches.sort((a, b) => b.score - a.score);
}

module.exports = { findMatches };
