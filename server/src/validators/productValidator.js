import { z } from "zod";

const productShape = {
  productName: z.string().trim().min(2, "Product name must be at least 2 characters."),
  sku: z.string().trim().min(3, "SKU must be at least 3 characters."),
  category: z.string().trim().min(2, "Category is required."),
  price: z.coerce.number().min(0, "Price cannot be negative."),
  cost: z.coerce.number().min(0, "Cost cannot be negative."),
  stockQuantity: z.coerce.number().int().min(0, "Stock quantity cannot be negative."),
  reorderLevel: z.coerce.number().int().min(0, "Reorder level cannot be negative."),
  lastUpdated: z.coerce.date().optional(),
};

export const createProductSchema = z.object(productShape).refine((product) => product.price >= product.cost, {
    message: "Price cannot be lower than cost.",
    path: ["price"],
  });

export const updateProductSchema = z.object(productShape).partial().refine(
  (product) => {
    if (product.price === undefined || product.cost === undefined) {
      return true;
    }

    return product.price >= product.cost;
  },
  {
    message: "Price cannot be lower than cost.",
    path: ["price"],
  },
);
