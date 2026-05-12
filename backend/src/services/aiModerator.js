const aiClient = require('./aiClient');

/**
 * AI Listing Moderator v1
 * Analyzes item listings for inconsistencies, fraud, and quality.
 */
exports.analyzeListing = async (listingData) => {
  const { title, description, category, condition, estimatedValue } = listingData;

  const systemPrompt = `
You are a Trust & Safety AI for Swaply, a professional barter marketplace. 
Analyze the provided listing for:
1. Contradictions (e.g., "New" but describes scratches).
2. Suspicious patterns (scam wording, unrealistic value).
3. Quality (vague descriptions).
4. Category mismatches.

Return a JSON object with:
- riskLevel: "Low", "Medium", or "High"
- confidence: 0.0 to 1.0
- flags: Array of specific concerns (e.g., ["Inconsistent Condition", "Suspicious Wording"])
- reasoning: Short explanation for admins.
- suggestions: Helpful advice for the user to improve the listing.

Important: Be helpful and guiding, not aggressive. "Medium" risk should be for suspicious but not obviously fraudulent items. "High" risk is for clear scams or dangerous content.
`;

  const userPrompt = `
Title: ${title}
Category: ${category}
Condition: ${condition}
Estimated Value: ${estimatedValue}
Description: ${description}
`;

  try {
    const response = await aiClient.chatCompletion(systemPrompt, userPrompt, { maxTokens: 500 });
    
    if (response) {
      // Extract JSON if AI wrapped it in markdown
      const jsonStr = response.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr);
    }
  } catch (err) {
    console.error('AI Moderation parsing failed, falling back to basic checks.', err);
  }

  // Fallback / Smart Demo behavior
  return this.runLocalChecks(listingData);
};

exports.runLocalChecks = (data) => {
  const flags = [];
  let riskLevel = 'Low';
  let confidence = 0.5;

  const desc = data.description.toLowerCase();
  const title = data.title.toLowerCase();

  // Simple inconsistency check
  if (data.condition === 'New' && (desc.includes('scratch') || desc.includes('crack') || desc.includes('used'))) {
    flags.push('Condition Inconsistency');
    riskLevel = 'Medium';
  }

  // Suspicious keywords
  const suspicious = ['whatsapp', 'telegram', 'payment first', 'wire transfer', 'shipping only'];
  if (suspicious.some(word => desc.includes(word))) {
    flags.push('Suspicious Contact Method');
    riskLevel = 'High';
  }

  // Quality check
  if (data.description.length < 20) {
    flags.push('Low Quality Description');
    if (riskLevel !== 'High') riskLevel = 'Medium';
  }

  return {
    riskLevel,
    confidence,
    flags,
    reasoning: flags.length > 0 ? `Detected flags: ${flags.join(', ')}` : 'No obvious issues detected by local engine.',
    suggestions: riskLevel !== 'Low' ? 'Try adding more detail and ensuring the condition matches your description.' : 'Listing looks good!'
  };
};
