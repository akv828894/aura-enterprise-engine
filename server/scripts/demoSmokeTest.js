import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import { app } from "../src/app.js";
import { Product } from "../src/models/Product.js";
import { makeDemoProduct } from "./demoData.js";

const requestJson = async (baseUrl, path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await response.json();
  return { response, body };
};

const run = async () => {
  const memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri());
  await Product.insertMany(Array.from({ length: 1200 }, (_, index) => makeDemoProduct(index)));
  await Product.syncIndexes();

  const server = app.listen(0);
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const inventory = await requestJson(baseUrl, "/api/inventory?search=laptop&limit=5&sort=-price");
    console.log("Inventory status:", inventory.response.status);
    console.log("Inventory returned:", inventory.body.data.length);
    console.log("Pagination:", inventory.body.pagination);

    const analytics = await requestJson(baseUrl, "/api/analytics");
    console.log("Analytics status:", analytics.response.status);
    console.log("KPI sample:", analytics.body.data.kpis);
    console.log("Restock chart rows:", analytics.body.data.restockPriority.length);
    console.log("Category chart rows:", analytics.body.data.valuationByCategory.length);

    const invalidProduct = await requestJson(baseUrl, "/api/inventory", {
      method: "POST",
      body: JSON.stringify({
        productName: "Invalid Margin Test",
        sku: "BAD-PRICE-001",
        category: "Electronics",
        price: 20,
        cost: 40,
        stockQuantity: -1,
        reorderLevel: 10,
      }),
    });
    console.log("Validation status:", invalidProduct.response.status);
    console.log("Validation errors:", invalidProduct.body.errors);
  } finally {
    server.close();
    await mongoose.disconnect();
    await memoryServer.stop();
  }
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
