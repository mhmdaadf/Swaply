const { chatCompletion, hasKey, HeuristicEngine } = require('./aiClient');

/**
 * AI Listing Wizard v2 — Context-Aware, Multi-Field, Adaptive
 *
 * Architecture:
 *   1. Full conversation history is sent to the LLM (not just last message)
 *   2. A structured "extractedFields" object accumulates data across turns
 *   3. The system prompt instructs the AI to NEVER re-ask known fields
 *   4. Confidence-based completion: once enough fields are known, generate listing
 *   5. Fallback heuristic engine when no API key is available
 */

const VALID_CATEGORIES = [
  'Electronics', 'Books', 'Clothing', 'Furniture', 'Sports',
  'Toys', 'Music', 'Art', 'Tools', 'Automotive', 'Collectibles', 'Other'
];
const VALID_CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

// ─── Heuristic Fallback (no API key) ───
function heuristicWizard(messages, extractedFields) {
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
  const allUserText = messages.filter(m => m.role === 'user').map(m => m.content).join(' ').toLowerCase();
  const fields = { ...extractedFields };

  // ── Category inference ──
  if (!fields.category) {
    const catMap = {
      Electronics: ['phone', 'iphone', 'samsung', 'laptop', 'macbook', 'ipad', 'tablet', 'pc', 'computer', 'playstation', 'ps5', 'ps4', 'xbox', 'switch', 'nintendo', 'headphone', 'earbuds', 'airpods', 'camera', 'gopro', 'drone', 'tv', 'monitor', 'speaker', 'keyboard', 'mouse', 'gpu', 'cpu', 'console', 'sony', 'apple', 'dell', 'hp', 'lenovo'],
      Clothing: ['shirt', 'shoes', 'sneakers', 'jacket', 'pants', 'dress', 'hoodie', 'hat', 'nike', 'adidas', 'jordan', 'yeezy', 'boots', 'coat', 'jeans'],
      Furniture: ['chair', 'desk', 'table', 'sofa', 'couch', 'bed', 'shelf', 'cabinet', 'wardrobe', 'lamp', 'mattress'],
      Sports: ['bike', 'bicycle', 'treadmill', 'weights', 'dumbbell', 'racket', 'ball', 'skate', 'surf', 'yoga', 'gym'],
      Books: ['book', 'novel', 'textbook', 'manga', 'comic'],
      Automotive: ['car', 'tire', 'wheel', 'engine', 'motorcycle', 'helmet'],
      Toys: ['lego', 'toy', 'figure', 'doll', 'puzzle', 'board game'],
      Music: ['guitar', 'piano', 'drum', 'violin', 'ukulele', 'speaker', 'amp', 'microphone'],
      Art: ['painting', 'canvas', 'sculpture', 'print', 'poster'],
      Tools: ['drill', 'saw', 'wrench', 'hammer', 'screwdriver', 'toolbox'],
      Collectibles: ['coin', 'stamp', 'card', 'vintage', 'antique', 'rare']
    };
    for (const [cat, keywords] of Object.entries(catMap)) {
      if (keywords.some(k => allUserText.includes(k))) {
        fields.category = cat;
        break;
      }
    }
  }

  // ── Condition inference ──
  if (!fields.condition) {
    if (/brand new|sealed|unopened|bnib/.test(allUserText)) fields.condition = 'New';
    else if (/like new|mint|barely used|excellent/.test(allUserText)) fields.condition = 'Like New';
    else if (/good|works? great|minor/.test(allUserText)) fields.condition = 'Good';
    else if (/fair|some wear|scratches|dent/.test(allUserText)) fields.condition = 'Fair';
    else if (/poor|broken|damaged|cracked/.test(allUserText)) fields.condition = 'Poor';
  }

  // ── Price inference ──
  if (!fields.originalPrice) {
    const priceMatch = allUserText.match(/\$?\s*(\d{2,5})/);
    if (priceMatch) fields.originalPrice = parseInt(priceMatch[1]);
  }

  // ── Age inference ──
  if (fields.ageMonths === undefined || fields.ageMonths === null) {
    if (/last year|a year ago|12 months|1 year/.test(allUserText)) fields.ageMonths = 12;
    else if (/6 months|half a year/.test(allUserText)) fields.ageMonths = 6;
    else if (/few months|couple months|2-3 months/.test(allUserText)) fields.ageMonths = 3;
    else if (/brand new|just bought|this month|last week/.test(allUserText)) fields.ageMonths = 0;
    else if (/(\d+)\s*months?\s*old/.test(allUserText)) {
      fields.ageMonths = parseInt(allUserText.match(/(\d+)\s*months?\s*old/)[1]);
    } else if (/(\d+)\s*years?\s*old/.test(allUserText)) {
      fields.ageMonths = parseInt(allUserText.match(/(\d+)\s*years?\s*old/)[1]) * 12;
    }
  }

  // ── Item name ──
  if (!fields.itemName) {
    const firstUserMsg = messages.find(m => m.role === 'user')?.content;
    if (firstUserMsg) fields.itemName = firstUserMsg.trim();
  }

  // ── Check what's missing ──
  const missing = [];
  if (!fields.itemName) missing.push('item name');
  if (!fields.condition) missing.push('condition');
  if (!fields.originalPrice) missing.push('original price');
  if (fields.ageMonths === undefined || fields.ageMonths === null) missing.push('age');

  // ── Complete? ──
  if (missing.length === 0) {
    const cat = fields.category || 'Other';
    const depreciation = { 'New': 0.85, 'Like New': 0.7, 'Good': 0.55, 'Fair': 0.4, 'Poor': 0.25 };
    const factor = depreciation[fields.condition] || 0.5;
    const ageFactor = Math.max(0.3, 1 - (fields.ageMonths / 60));
    const swapPointValue = Math.round(fields.originalPrice * factor * ageFactor);

    return {
      isComplete: true,
      recommendation: {
        title: fields.itemName,
        description: `${fields.condition} ${cat} item. Originally $${fields.originalPrice}, approximately ${fields.ageMonths} months old. Ready for swap.`,
        category: cat,
        condition: fields.condition,
        originalPrice: fields.originalPrice,
        ageMonths: fields.ageMonths,
        swapPointValue
      },
      message: "Your listing is ready! Review the details below."
    };
  }

  // ── Ask for missing fields (batched) ──
  let question;
  if (missing.length === 1) {
    question = `Almost there! What's the ${missing[0]}?`;
  } else if (missing.length <= 3) {
    question = `Quick details needed: ${missing.join(', ')}?`;
  } else {
    question = `Tell me more about this item — ${missing.join(', ')}?`;
  }

  return { isComplete: false, message: question, extractedFields: fields };
}

// ─── Main Wizard Handler ───
exports.getWizardResponse = async (messages, extractedFields = {}) => {
  // If no AI key, use heuristic engine
  if (!hasKey()) {
    return heuristicWizard(messages, extractedFields);
  }

  // ── Build conversation history for LLM ──
  const conversationSummary = messages
    .filter(m => m.role === 'user')
    .map((m, i) => `Turn ${i + 1}: "${m.content}"`)
    .join('\n');

  const SYSTEM_PROMPT = `You are Swaply's AI Listing Assistant. You help users create marketplace swap listings in 2-3 messages MAX.

## CORE RULES

1. **CONTEXT MEMORY**: You receive ALL previous user messages and extracted data. NEVER re-ask anything already known.
2. **INFERENCE FIRST**: Extract as much as possible from what the user says. If they say "iPhone 13, small scratches, bought last year" — you already know: category=Electronics, condition=Good, age≈12 months. Do NOT ask for these.
3. **MULTI-FIELD QUESTIONS**: When you need multiple things, combine them naturally into ONE question. Example: "What did you pay for it, and does it come with any accessories?"
4. **COMPLETION DETECTION**: Once you have item name, condition, approximate price, and age — STOP asking and generate the listing. Category can always be inferred.
5. **NEVER** use generic AI phrases like "Great!", "Sure thing!", "I'd be happy to help!". Be concise and direct like a smart marketplace assistant.

## FIELD TRACKING

Already extracted fields: ${JSON.stringify(extractedFields)}

If a field has a value, it is CONFIRMED. Do not ask about it again.

## REQUIRED FIELDS (minimum to generate listing)
- itemName: what the item is
- category: one of [${VALID_CATEGORIES.join(', ')}]
- condition: one of [${VALID_CONDITIONS.join(', ')}]
- originalPrice: number in dollars
- ageMonths: approximate age in months

## OPTIONAL (infer or skip)
- description: YOU write this from context
- desiredItems: what they want in return (ask only if natural)

## RESPONSE FORMAT

ALWAYS respond with valid JSON only. No markdown, no explanation outside JSON.

When more info needed:
{
  "isComplete": false,
  "message": "Your concise question here",
  "extractedFields": {
    "itemName": "extracted or null",
    "category": "inferred or null",
    "condition": "inferred or null",
    "originalPrice": null,
    "ageMonths": null
  }
}

When ready to generate listing:
{
  "isComplete": true,
  "recommendation": {
    "title": "Professional SEO-optimized title",
    "description": "Compelling 2-3 sentence marketplace description",
    "category": "Exact category from allowed list",
    "condition": "Exact condition from allowed list",
    "originalPrice": <number>,
    "ageMonths": <number>,
    "swapPointValue": <calculated number based on depreciation>
  },
  "message": "Your listing is ready — review below and post when you're happy with it."
}

## SWAP POINT CALCULATION
swapPointValue = originalPrice × conditionFactor × ageFactor
conditionFactor: New=0.85, Like New=0.70, Good=0.55, Fair=0.40, Poor=0.25
ageFactor: max(0.3, 1 - ageMonths/60)`;

  const userPrompt = `## CONVERSATION SO FAR
${conversationSummary}

## CURRENT EXTRACTED DATA
${JSON.stringify(extractedFields)}

## LATEST MESSAGE
"${messages[messages.length - 1]?.content}"

Analyze ALL messages above. Extract every possible field from context. Then respond with the appropriate JSON — either ask ONE combined follow-up question, or generate the final listing if you have enough info.`;

  try {
    const reply = await chatCompletion(SYSTEM_PROMPT, userPrompt, { maxTokens: 600 });
    if (reply) {
      const jsonMatch = reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // Validate category against allowed list
        if (parsed.extractedFields?.category && !VALID_CATEGORIES.includes(parsed.extractedFields.category)) {
          parsed.extractedFields.category = inferCategory(parsed.extractedFields.category);
        }
        if (parsed.recommendation?.category && !VALID_CATEGORIES.includes(parsed.recommendation.category)) {
          parsed.recommendation.category = inferCategory(parsed.recommendation.category);
        }

        // Validate condition
        if (parsed.extractedFields?.condition && !VALID_CONDITIONS.includes(parsed.extractedFields.condition)) {
          parsed.extractedFields.condition = inferCondition(parsed.extractedFields.condition);
        }
        if (parsed.recommendation?.condition && !VALID_CONDITIONS.includes(parsed.recommendation.condition)) {
          parsed.recommendation.condition = inferCondition(parsed.recommendation.condition);
        }

        return parsed;
      }
    }
    // LLM returned non-JSON — fall back to heuristic
    return heuristicWizard(messages, extractedFields);
  } catch (err) {
    console.error('Wizard v2 Error:', err.message);
    return heuristicWizard(messages, extractedFields);
  }
};

// ─── Helpers ───
function inferCategory(raw) {
  if (!raw) return 'Other';
  const lower = raw.toLowerCase();
  const match = VALID_CATEGORIES.find(c => lower.includes(c.toLowerCase()));
  return match || 'Other';
}

function inferCondition(raw) {
  if (!raw) return 'Good';
  const lower = raw.toLowerCase();
  if (lower.includes('new') && lower.includes('like')) return 'Like New';
  if (lower.includes('new')) return 'New';
  if (lower.includes('good') || lower.includes('great')) return 'Good';
  if (lower.includes('fair') || lower.includes('okay')) return 'Fair';
  if (lower.includes('poor') || lower.includes('bad')) return 'Poor';
  return 'Good';
}
