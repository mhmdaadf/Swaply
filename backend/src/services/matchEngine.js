/**
 * Smart Matching Engine
 *
 * Bi-directional matching: finds users where A has what B wants AND B has what A wants.
 * Scores matches based on keyword relevance and value proximity.
 */

const Item = require('../models/Item');

async function findMatches(userId) {
  // Get current user's available items and their desired items
  const myItems = await Item.find({ owner: userId, status: 'available' });

  if (myItems.length === 0) return [];

  // Collect what I have (my item titles + categories) and what I want
  const myCategories = new Set(myItems.map(i => i.category));
  const myDesired = new Set();
  myItems.forEach(item => {
    item.desiredItems.forEach(d => myDesired.add(d.toLowerCase()));
  });
  const myTitles = myItems.map(i => i.title.toLowerCase());

  // Get all other users' available items
  const otherItems = await Item.find({
    owner: { $ne: userId },
    status: 'available',
  }).populate('owner', 'username trustScore profilePic');

  // Group items by owner
  const ownerMap = new Map();
  otherItems.forEach(item => {
    const ownerId = item.owner._id.toString();
    if (!ownerMap.has(ownerId)) {
      ownerMap.set(ownerId, { user: item.owner, items: [] });
    }
    ownerMap.get(ownerId).items.push(item);
  });

  const matches = [];

  for (const [ownerId, { user, items }] of ownerMap) {
    const theirDesired = new Set();
    items.forEach(item => {
      item.desiredItems.forEach(d => theirDesired.add(d.toLowerCase()));
    });
    const theirCategories = new Set(items.map(i => i.category));

    // Check: do they have something I want?
    let iWantScore = 0;
    const theirMatchedItems = [];
    items.forEach(item => {
      const titleLower = item.title.toLowerCase();
      // Exact keyword match in my desired list
      if (myDesired.has(titleLower) || myDesired.has(item.category.toLowerCase())) {
        iWantScore += 10;
        theirMatchedItems.push(item);
      } else {
        // Partial match — check if any of my desired keywords appear in their title
        for (const desired of myDesired) {
          if (titleLower.includes(desired) || desired.includes(titleLower)) {
            iWantScore += 5;
            theirMatchedItems.push(item);
            break;
          }
        }
      }
      // Category match as fallback
      if (myDesired.has(item.category.toLowerCase())) {
        iWantScore += 3;
      }
    });

    // Check: do they want something I have?
    let theyWantScore = 0;
    const myMatchedItems = [];
    myItems.forEach(item => {
      const titleLower = item.title.toLowerCase();
      if (theirDesired.has(titleLower) || theirDesired.has(item.category.toLowerCase())) {
        theyWantScore += 10;
        myMatchedItems.push(item);
      } else {
        for (const desired of theirDesired) {
          if (titleLower.includes(desired) || desired.includes(titleLower)) {
            theyWantScore += 5;
            myMatchedItems.push(item);
            break;
          }
        }
      }
      if (theirDesired.has(item.category.toLowerCase())) {
        theyWantScore += 3;
      }
    });

    // Only include if there is a bi-directional match
    if (iWantScore > 0 && theyWantScore > 0) {
      // Value proximity bonus — closer values get higher score
      let valueFairness = 1;
      if (theirMatchedItems.length > 0 && myMatchedItems.length > 0) {
        const theirValue = theirMatchedItems.reduce((s, i) => s + i.swapPointValue, 0);
        const myValue = myMatchedItems.reduce((s, i) => s + i.swapPointValue, 0);
        const maxVal = Math.max(theirValue, myValue, 1);
        const diff = Math.abs(theirValue - myValue) / maxVal;
        valueFairness = diff < 0.2 ? 1.5 : diff < 0.5 ? 1.0 : 0.7;
      }

      const totalScore = (iWantScore + theyWantScore) * valueFairness;

      matches.push({
        user: {
          _id: user._id,
          username: user.username,
          trustScore: user.trustScore,
          profilePic: user.profilePic,
        },
        theirItems: theirMatchedItems.map(i => ({
          _id: i._id,
          title: i.title,
          category: i.category,
          condition: i.condition,
          swapPointValue: i.swapPointValue,
          images: i.images,
        })),
        myItems: myMatchedItems.map(i => ({
          _id: i._id,
          title: i.title,
          category: i.category,
          condition: i.condition,
          swapPointValue: i.swapPointValue,
          images: i.images,
        })),
        score: Math.round(totalScore),
        valueFairness: valueFairness >= 1.5 ? 'fair' : valueFairness >= 1.0 ? 'moderate' : 'uneven',
      });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return matches;
}

module.exports = { findMatches };
