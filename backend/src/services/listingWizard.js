const { chatCompletion } = require('./aiClient');

/**
 * AI Listing Wizard Service
 * Handles the conversation flow for creating a new item listing.
 */

exports.getWizardResponse = async (messages, currentData) => {
  const SYSTEM_PROMPT = `You are the Swaply Listing Concierge. Your goal is to help a user create a high-quality barter listing through a friendly conversation.

RULES:
1. USE COMMON SENSE. Silently categorize items (e.g. PlayStation = Electronics).
2. HANDLE AMBIGUITY. If a name is generic (e.g. "PlayStation", "iPhone", "Car"), ask for the specific model/version (e.g. "Is it a PS5, PS4 Pro?") in the same message as the condition/age.
3. NEVER ask the same question twice.
4. Aim to complete the listing in 2 turns. Turn 1: Clarify version + ask for condition/age. Turn 2: Recommendation.
5. Treat "No" as a final answer.

Required Info to collect:
- Item Name (already started)
- Category (Electronics, Furniture, etc.)
- Condition (New, Like New, Good, Fair, Poor)
- Original Price ($)
- Age (months)
- Description (you will write this for them based on their answers)

FINAL JSON FORMAT (only return this when done):
{
  "isComplete": true,
  "recommendation": {
    "title": "Optimized Title",
    "description": "Professional description you wrote",
    "category": "Detected Category",
    "condition": "Detected Condition",
    "originalPrice": <number>,
    "ageMonths": <number>,
    "swapPointValue": <number>
  },
  "message": "I've prepared your perfect listing! Check the details below and click post when you're ready."
}

INTERIM RESPONSE FORMAT:
{
  "isComplete": false,
  "message": "Your next question here...",
  "currentData": { ... any data you've extracted so far ... }
}`;

  const userMessage = messages[messages.length - 1].content;
  const prompt = `User just said: "${userMessage}"\n\nCurrent Extracted Data: ${JSON.stringify(currentData)}\n\nRespond with the next step in JSON.`;

  try {
    const reply = await chatCompletion(SYSTEM_PROMPT, prompt);
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { isComplete: false, message: "Tell me more about the item!", currentData };
  } catch (err) {
    console.error('Wizard Error:', err);
    return { isComplete: false, message: "I'm having trouble thinking. Can you tell me the condition and price?", currentData };
  }
};
