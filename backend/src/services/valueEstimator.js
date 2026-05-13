/**
 * AI Value Estimator v2 — Real AI-Powered Valuation
 *
 * When an AI key is present (Groq / OpenAI):
 *   1. Computes a heuristic baseline (depreciation formula)
 *   2. Sends full item context + baseline to the LLM
 *   3. LLM returns swap-point value, reasoning, AND a confidence score
 *   4. AI value is used directly (clamped for safety) — NOT overridden by heuristic
 *
 * Fallback (no key): heuristic formula + Heuristic Engine template reasoning
 */

const { chatCompletion, HeuristicEngine, hasKey } = require('./aiClient');

// ---------- Depreciation tables (used for baseline & fallback) ----------

const CATEGORY_DEPRECIATION = {
  Electronics: 0.25, Books: 0.10, Clothing: 0.20, Furniture: 0.08, Sports: 0.15,
  Toys: 0.18, Music: 0.12, Art: 0.05, Tools: 0.10, Automotive: 0.12,
  Collectibles: 0.03, Other: 0.15,
};

const CONDITION_MULTIPLIER = {
  'New': 1.0, 'Like New': 0.85, 'Good': 0.65, 'Fair': 0.45, 'Poor': 0.25,
};

function heuristicEstimate({ category, originalPrice, condition, ageMonths }) {
  if (!originalPrice || originalPrice <= 0) return 0;
  const depreciationRate = CATEGORY_DEPRECIATION[category] || 0.15;
  const conditionMult = CONDITION_MULTIPLIER[condition] || 0.5;
  const years = (ageMonths || 0) / 12;
  const ageFactor = Math.exp(-depreciationRate * years);
  let value = originalPrice * conditionMult * ageFactor;
  value = Math.max(value, originalPrice * 0.05);
  value = Math.min(value, 10000);
  return Math.round(value);
}

// ---------- AI prompt engineering ----------

const SYSTEM_PROMPT = `You are a professional item valuation expert for Swaply, a barter trading platform.
Your job is to estimate the fair swap value of items in "Swap Points" (1 point ≈ $1 USD).

Consider ALL of the following when estimating:
- Original retail price and current market resale value
- Item condition and age-based depreciation
- Brand reputation and demand in the secondhand market
- Category-specific value retention (e.g. collectibles hold value better than electronics)
- The description details (accessories included, cosmetic damage, completeness)
- Current "Internal Listings" on the Swaply platform
- **Honesty Audit**: Cross-reference the "Condition" field with the "Description". Look for contradictions (e.g., if they say "Like New" but describe "scratches" or "broken parts").

You will receive a heuristic baseline computed from a depreciation formula. Your job is to IMPROVE on this baseline using your knowledge of real-world market values AND the internal listings provided.

Respond ONLY with valid JSON — no markdown, no backticks, no explanation outside JSON:
{
  "swapPoints": <integer>, 
  "confidence": <0.0-1.0>, 
  "honestyScore": <0.0-1.0>,
  "redFlags": ["string", "string"],
  "reasoning": "<2-3 sentences explaining your valuation and honesty audit>"
}`;

function buildUserPrompt({ title, description, category, originalPrice, condition, ageMonths, heuristicBaseline, internalListings }) {
  const lines = [
    `Item: ${title || 'Unknown Item'}`,
    `Category: ${category}`,
    `Condition: ${condition}`,
    `Original Price: $${originalPrice}`,
    `Age: ${ageMonths || 0} months`,
    `Description: ${description || 'No description provided'}`,
    ``,
    `Heuristic Baseline: ${heuristicBaseline} Swap Points`,
  ];

  if (internalListings && internalListings.length > 0) {
    lines.push(``);
    lines.push(`CURRENT SIMILAR LISTINGS ON SWAPLY:`);
    internalListings.forEach(item => {
      lines.push(`- ${item.title}: ${item.value} pts (Condition: ${item.condition})`);
    });
    lines.push(`(Use these to calibrate the value against what is already available on the site.)`);
  } else {
    lines.push(``);
    lines.push(`(No similar items currently listed on Swaply. Base your value on global market trends and the heuristic.)`);
  }

  return lines.join('\n');
}

// ---------- Main estimation function ----------

async function estimateValue({ category, originalPrice, condition, ageMonths, title, description, internalListings }) {
  const baseline = heuristicEstimate({ category, originalPrice, condition, ageMonths });

  if (!originalPrice || originalPrice <= 0) {
    return { swapPointValue: 0, reasoning: null, method: 'heuristic', confidence: null };
  }

  if (hasKey()) {
    try {
      const userPrompt = buildUserPrompt({
        title, description, category, originalPrice, condition, ageMonths,
        heuristicBaseline: baseline,
        internalListings, // Pass internal listings to prompt builder
      });

      const reply = await chatCompletion(SYSTEM_PROMPT, userPrompt, {
        cacheKey: `v:${title}:${category}:${condition}:${originalPrice}:${ageMonths}`,
      });

      if (reply) {
        const jsonMatch = reply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          let aiValue = parseInt(parsed.swapPoints, 10);
          const confidence = parseFloat(parsed.confidence) || 0.7;
          const honestyScore = parseFloat(parsed.honestyScore) || 1.0;
          const redFlags = Array.isArray(parsed.redFlags) ? parsed.redFlags : [];

          // Validate AI value is reasonable
          if (!isNaN(aiValue) && aiValue > 0) {
            // Safety clamp: AI can deviate up to ±4x from baseline
            const lowerBound = Math.max(1, Math.round(baseline * 0.25));
            const upperBound = Math.round(baseline * 4);
            aiValue = Math.max(lowerBound, Math.min(upperBound, aiValue));
            aiValue = Math.min(aiValue, 10000);

            return {
              swapPointValue: aiValue,
              reasoning: parsed.reasoning || null,
              method: 'ai',
              confidence: Math.max(0, Math.min(1, confidence)),
              honestyScore: Math.max(0, Math.min(1, honestyScore)),
              redFlags,
              baseline, // expose baseline so frontend can show "AI adjusted from X to Y"
            };
          }
        }
      }
    } catch (err) {
      console.error('[ValueEstimator] AI Error:', err.message);
    }
  }

  // Smart Demo Fallback
  return {
    swapPointValue: baseline,
    reasoning: HeuristicEngine.generateReasoning({ title: title || category, category, condition, originalPrice }),
    method: hasKey() ? 'ai-fallback' : 'demo',
    confidence: null,
    baseline,
  };
}

module.exports = { estimateValue, estimateValueSync: heuristicEstimate };
