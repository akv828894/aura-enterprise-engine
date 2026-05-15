import "dotenv/config";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import { app } from "../src/app.js";
import { Product } from "../src/models/Product.js";
import { makeDemoProduct } from "./demoData.js";

const port = process.env.PORT || 5000;
const demoCount = Number(process.env.DEMO_PRODUCT_COUNT) || 5000;

const start = async () => {
  const memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri());
  await Product.insertMany(Array.from({ length: demoCount }, (_, index) => makeDemoProduct(index)));
  await Product.syncIndexes();

  const server = app.listen(port, () => {
    console.log(`Aura Engine demo API running on http://127.0.0.1:${port}`);
    console.log(`Seeded ${demoCount} in-memory products. Stop this terminal to clear demo data.`);
  });

  const shutdown = async () => {
    server.close();
    await mongoose.disconnect();
    await memoryServer.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

start().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
