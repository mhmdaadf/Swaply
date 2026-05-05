/**
 * AI Value Estimator
 *
 * Calculates a "Swap Point" value using category-specific depreciation,
 * condition multipliers, and age-based decay.
 */

const CATEGORY_DEPRECIATION = {
  Electronics: 0.25,
  Books: 0.10,
  Clothing: 0.20,
  Furniture: 0.08,
  Sports: 0.15,
  Toys: 0.18,
  Music: 0.12,
  Art: 0.05,
  Tools: 0.10,
  Automotive: 0.12,
  Collectibles: 0.03,
  Other: 0.15,
};

const CONDITION_MULTIPLIER = {
  'New': 1.0,
  'Like New': 0.85,
  'Good': 0.65,
  'Fair': 0.45,
  'Poor': 0.25,
};

function estimateValue({ category, originalPrice, condition, ageMonths }) {
  if (!originalPrice || originalPrice <= 0) return 0;

  const depreciationRate = CATEGORY_DEPRECIATION[category] || 0.15;
  const conditionMult = CONDITION_MULTIPLIER[condition] || 0.5;
  const years = (ageMonths || 0) / 12;

  // Exponential decay: value = price * condition * e^(-rate * years)
  const ageFactor = Math.exp(-depreciationRate * years);
  let value = originalPrice * conditionMult * ageFactor;

  // Floor at 5% of original price, cap at 10000
  value = Math.max(value, originalPrice * 0.05);
  value = Math.min(value, 10000);

  return Math.round(value);
}

module.exports = { estimateValue, CATEGORY_DEPRECIATION, CONDITION_MULTIPLIER };
