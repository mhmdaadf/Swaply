/**
 * Seed script — populates the database with test data.
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Item = require('./models/Item');
const { estimateValue } = require('./services/valueEstimator');

const users = [
  { username: 'alice', email: 'alice@test.com', password: 'password123', wishlistCategories: ['Electronics', 'Books'] },
  { username: 'bob', email: 'bob@test.com', password: 'password123', wishlistCategories: ['Furniture', 'Music'] },
  { username: 'carol', email: 'carol@test.com', password: 'password123', wishlistCategories: ['Clothing', 'Art'] },
  { username: 'dave', email: 'dave@test.com', password: 'password123', wishlistCategories: ['Electronics', 'Sports'] },
];

const itemTemplates = [
  { title: 'Sony WH-1000XM5 Headphones', category: 'Electronics', condition: 'Like New', originalPrice: 350, ageMonths: 6, desiredItems: ['books', 'furniture', 'desk lamp'], description: 'Premium noise-cancelling headphones. Includes original box and accessories.', images: ['/uploads/seed_headphones.png'] },
  { title: 'The Art of Programming', category: 'Books', condition: 'Good', originalPrice: 45, ageMonths: 12, desiredItems: ['electronics', 'headphones'], description: 'Classic programming reference book in good condition.', images: [] },
  { title: 'IKEA Standing Desk', category: 'Furniture', condition: 'Good', originalPrice: 500, ageMonths: 18, desiredItems: ['electronics', 'guitar', 'music'], description: 'Adjustable height standing desk. Minor wear on surface.', images: ['/uploads/seed_desk.png'] },
  { title: 'Fender Acoustic Guitar', category: 'Music', condition: 'Like New', originalPrice: 400, ageMonths: 3, desiredItems: ['clothing', 'art', 'painting'], description: 'Beautiful acoustic guitar, barely played. Comes with case.', images: ['/uploads/seed_guitar.png'] },
  { title: 'North Face Winter Jacket', category: 'Clothing', condition: 'New', originalPrice: 250, ageMonths: 0, desiredItems: ['music', 'guitar', 'electronics'], description: 'Brand new with tags. Size L.', images: ['/uploads/seed_jacket.png'] },
  { title: 'Oil Painting — Sunset', category: 'Art', condition: 'New', originalPrice: 300, ageMonths: 1, desiredItems: ['clothing', 'jacket', 'furniture'], description: 'Original oil painting on canvas. 24x36 inches.', images: ['/uploads/seed_painting.png'] },
  { title: 'Wilson Tennis Racket', category: 'Sports', condition: 'Fair', originalPrice: 180, ageMonths: 24, desiredItems: ['electronics', 'headphones', 'camera'], description: 'Professional grade racket with some wear on the grip.', images: [] },
  { title: 'Canon EOS R50 Camera', category: 'Electronics', condition: 'Like New', originalPrice: 800, ageMonths: 4, desiredItems: ['art', 'painting', 'sports equipment'], description: 'Mirrorless camera with 18-45mm lens kit. Under warranty.', images: ['/uploads/seed_camera.png'] },
  { title: 'Vintage Vinyl Collection', category: 'Music', condition: 'Good', originalPrice: 200, ageMonths: 60, desiredItems: ['books', 'electronics'], description: 'Collection of 30 classic rock vinyl records from the 70s and 80s.', images: [] },
  { title: 'Herman Miller Chair', category: 'Furniture', condition: 'Good', originalPrice: 1200, ageMonths: 36, desiredItems: ['electronics', 'camera', 'sports'], description: 'Ergonomic office chair. Mesh back, adjustable arms.', images: [] },
  { title: 'Raspberry Pi 5 Kit', category: 'Electronics', condition: 'New', originalPrice: 120, ageMonths: 0, desiredItems: ['books', 'tools'], description: 'Complete starter kit with case, power supply, and SD card.', images: [] },
  { title: 'DeWalt Drill Set', category: 'Tools', condition: 'Like New', originalPrice: 200, ageMonths: 8, desiredItems: ['electronics', 'furniture'], description: '20V MAX drill with 2 batteries, charger, and bit set.', images: ['/uploads/seed_drill.png'] },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Item.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const u of users) {
      const user = await User.create(u);
      createdUsers.push(user);
      console.log(`  Created user: ${user.username}`);
    }

    // Create items — distribute across users
    for (let i = 0; i < itemTemplates.length; i++) {
      const template = itemTemplates[i];
      const owner = createdUsers[i % createdUsers.length];
      const estimation = await estimateValue(template);

      await Item.create({
        ...template,
        swapPointValue: estimation.swapPointValue,
        owner: owner._id,
      });
      console.log(`  Created item: ${template.title} (${estimation.swapPointValue} pts) -> ${owner.username}`);
    }

    console.log('\nSeed completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
