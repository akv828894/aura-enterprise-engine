const allowedSortFields = new Set([
  "productName",
  "sku",
  "category",
  "price",
  "cost",
  "stockQuantity",
  "reorderLevel",
  "lastUpdated",
]);

export const buildInventoryQuery = (query) => {
  const filter = {};

  if (query.search?.trim()) {
    const search = query.search.trim();
    filter.$or = [
      { productName: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];
  }

  if (query.category && query.category !== "all") {
    filter.category = query.category;
  }

  if (query.maxStock !== undefined && query.maxStock !== "") {
    filter.stockQuantity = { ...filter.stockQuantity, $lte: Number(query.maxStock) };
  }

  if (query.minPrice !== undefined && query.minPrice !== "") {
    filter.price = { ...filter.price, $gte: Number(query.minPrice) };
  }

  if (query.maxPrice !== undefined && query.maxPrice !== "") {
    filter.price = { ...filter.price, $lte: Number(query.maxPrice) };
  }

  return filter;
};

export const buildSort = (sortParam = "productName") => {
  const direction = sortParam.startsWith("-") ? -1 : 1;
  const field = sortParam.replace("-", "");

  if (!allowedSortFields.has(field)) {
    return { productName: 1 };
  }

  return { [field]: direction };
};
