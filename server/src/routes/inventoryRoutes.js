import { Router } from "express";
import {
  createProduct,
  getCategories,
  getInventory,
  updateProduct,
} from "../controllers/inventoryController.js";
import { validate } from "../middleware/validate.js";
import { createProductSchema, updateProductSchema } from "../validators/productValidator.js";

export const inventoryRouter = Router();

inventoryRouter.get("/", getInventory);
inventoryRouter.get("/categories", getCategories);
inventoryRouter.post("/", validate(createProductSchema), createProduct);
inventoryRouter.put("/:id", validate(updateProductSchema), updateProduct);
