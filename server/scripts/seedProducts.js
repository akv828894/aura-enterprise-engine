import "dotenv/config";
import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import { connectDatabase } from "../src/config/db.js";
import { Product } from "../src/models/Product.js";

const categories = [
  "Electronics",
  "Apparel",
  "Home Goods",
  "Outdoor",
  "Beauty",
  "Automotive",
  "Office",
  "Grocery",
  "Toys",
  "Industrial",
];

const targetCount = Number(process.argv[2]) || 50000;
const batchSize = 1000;

const buildProduct = (index) => {
  const cost = Number(faker.commerce.price({ min: 4, max: 700, dec: 2 }));
  const margin = faker.number.float({ min: 1.08, max: 1.85, fractionDigits: 2 });
  const stockQuantity = faker.number.int({ min: 0, max: 850 });

  return {
    productName: faker.commerce.productName(),
    sku: `AUR-${String(index + 1).padStart(6, "0")}`,
    category: faker.helpers.arrayElement(categories),
    price: Number((cost * margin).toFixed(2)),
    cost,
    stockQuantity,
    reorderLevel: faker.number.int({ min: 10, max: 120 }),
    lastUpdated: faker.date.recent({ days: 45 }),
  };
};

const seedProducts = async () => {
  await connectDatabase();
  await Product.deleteMany({});

  console.time(`Seeded ${targetCount} products`);

  for (let start = 0; start < targetCount; start += batchSize) {
    const batch = Array.from(
      { length: Math.min(batchSize, targetCount - start) },
      (_, index) => buildProduct(start + index),
    );

    await Product.insertMany(batch, { ordered: false });
    console.log(`Inserted ${Math.min(start + batchSize, targetCount)} / ${targetCount}`);
  }

  await Product.syncIndexes();
  console.timeEnd(`Seeded ${targetCount} products`);
  await mongoose.disconnect();
};

seedProducts().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
