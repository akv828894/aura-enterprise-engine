import { faker } from "@faker-js/faker";

export const demoCategories = ["Electronics", "Apparel", "Office", "Home Goods", "Industrial"];

export const makeDemoProduct = (index) => {
  const cost = Number(faker.commerce.price({ min: 10, max: 400, dec: 2 }));
  const price = Number((cost * faker.number.float({ min: 1.15, max: 1.75, fractionDigits: 2 })).toFixed(2));

  return {
    productName: index % 9 === 0 ? `Laptop Docking Station ${index}` : faker.commerce.productName(),
    sku: `DEMO-${String(index + 1).padStart(5, "0")}`,
    category: demoCategories[index % demoCategories.length],
    price,
    cost,
    stockQuantity: index < 10 ? index : faker.number.int({ min: 12, max: 700 }),
    reorderLevel: faker.number.int({ min: 10, max: 90 }),
    lastUpdated: faker.date.recent({ days: 30 }),
  };
};
