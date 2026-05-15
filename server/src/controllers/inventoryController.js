import { Product } from "../models/Product.js";
import { buildInventoryQuery, buildSort } from "../utils/queryBuilder.js";

export const getInventory = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 500);
    const skip = (page - 1) * limit;
    const filter = buildInventoryQuery(req.query);
    const sort = buildSort(req.query.sort);

    const [products, totalRecords] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.max(Math.ceil(totalRecords / limit), 1);

    res.json({
      data: products,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct("category");
    res.json({ data: categories.sort() });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const existingProduct = await Product.findById(req.params.id);

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found." });
    }

    const mergedProduct = { ...existingProduct.toObject(), ...req.body };

    if (mergedProduct.price < mergedProduct.cost) {
      return res.status(400).json({
        message: "Validation failed.",
        errors: [{ field: "price", message: "Price cannot be lower than cost." }],
      });
    }

    Object.assign(existingProduct, req.body, { lastUpdated: new Date() });
    const product = await existingProduct.save();

    return res.json({ data: product });
  } catch (error) {
    return next(error);
  }
};
