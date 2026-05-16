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

const productWords = [
  "Wireless Headphones",
  "Laptop Docking Station",
  "Thermal Label Printer",
  "Cotton Work Jacket",
  "LED Desk Lamp",
  "Storage Bin Set",
  "Bluetooth Scanner",
  "Safety Gloves",
  "Ceramic Cookware",
  "Portable Charger",
];

let cachedProducts;

const buildDemoProducts = () => {
  if (cachedProducts) {
    return cachedProducts;
  }

  cachedProducts = Array.from({ length: 50000 }, (_, index) => {
    const category = categories[index % categories.length];
    const baseCost = 8 + ((index * 17) % 720);
    const cost = Number((baseCost + (index % 9) * 0.45).toFixed(2));
    const price = Number((cost * (1.18 + (index % 8) * 0.07)).toFixed(2));
    const stockQuantity = index < 16 ? index : (index * 13) % 900;

    return {
      _id: `demo-${String(index + 1).padStart(6, "0")}`,
      productName: `${productWords[index % productWords.length]} ${String(index + 1).padStart(5, "0")}`,
      sku: `AUR-${String(index + 1).padStart(6, "0")}`,
      category,
      price,
      cost,
      stockQuantity,
      reorderLevel: 20 + ((index * 7) % 95),
      lastUpdated: new Date(Date.now() - (index % 45) * 86400000).toISOString(),
    };
  });

  return cachedProducts;
};

const sortProducts = (products, sort = "productName") => {
  const direction = sort.startsWith("-") ? -1 : 1;
  const field = sort.replace("-", "");

  return [...products].sort((first, second) => {
    if (first[field] < second[field]) return -1 * direction;
    if (first[field] > second[field]) return 1 * direction;
    return 0;
  });
};

const filterProducts = (query) => {
  const search = query.get("search")?.trim().toLowerCase();
  const category = query.get("category");
  const maxStock = query.get("maxStock");
  const minPrice = query.get("minPrice");
  const maxPrice = query.get("maxPrice");

  return buildDemoProducts().filter((product) => {
    if (search && !`${product.productName} ${product.sku}`.toLowerCase().includes(search)) {
      return false;
    }

    if (category && category !== "all" && product.category !== category) {
      return false;
    }

    if (maxStock && product.stockQuantity > Number(maxStock)) {
      return false;
    }

    if (minPrice && product.price < Number(minPrice)) {
      return false;
    }

    if (maxPrice && product.price > Number(maxPrice)) {
      return false;
    }

    return true;
  });
};

const getAnalytics = () => {
  const products = buildDemoProducts();
  const valuationMap = new Map();

  let totalInventoryValue = 0;
  let outOfStockItems = 0;

  for (const product of products) {
    const value = product.price * product.stockQuantity;
    totalInventoryValue += value;
    outOfStockItems += product.stockQuantity === 0 ? 1 : 0;
    const current = valuationMap.get(product.category) || { category: product.category, totalValue: 0, skuCount: 0 };
    current.totalValue += value;
    current.skuCount += 1;
    valuationMap.set(product.category, current);
  }

  const valuationByCategory = Array.from(valuationMap.values())
    .map((category) => ({
      ...category,
      totalValue: Number(category.totalValue.toFixed(2)),
    }))
    .sort((first, second) => second.totalValue - first.totalValue);

  const restockPriority = sortProducts(products, "stockQuantity")
    .slice(0, 10)
    .map(({ productName, sku, stockQuantity, reorderLevel }) => ({
      productName,
      sku,
      stockQuantity,
      reorderLevel,
    }));

  return {
    kpis: {
      totalSkus: products.length,
      totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
      outOfStockItems,
    },
    restockPriority,
    valuationByCategory,
  };
};

const sendJson = (res, status, body) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  return res.status(status).json(body);
};

export const handleFallbackApi = (req, res) => {
  if (req.method === "OPTIONS") {
    return sendJson(res, 204, {});
  }

  const url = new URL(req.url || "/", "https://aura-engine-api.vercel.app");
  const path = url.pathname;

  if (path.endsWith("/api/health") || path.endsWith("/health")) {
    return sendJson(res, 200, { status: "ok", service: "Aura Engine API", mode: "demo" });
  }

  if (path.endsWith("/api/inventory/categories") || path.endsWith("/inventory/categories")) {
    return sendJson(res, 200, { data: categories });
  }

  if (path.endsWith("/api/analytics") || path.endsWith("/analytics")) {
    return sendJson(res, 200, { data: getAnalytics() });
  }

  if ((path.endsWith("/api/inventory") || path.endsWith("/inventory")) && req.method === "GET") {
    const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 50, 1), 500);
    const filteredProducts = sortProducts(filterProducts(url.searchParams), url.searchParams.get("sort") || "productName");
    const totalRecords = filteredProducts.length;
    const totalPages = Math.max(Math.ceil(totalRecords / limit), 1);
    const data = filteredProducts.slice((page - 1) * limit, page * limit);

    return sendJson(res, 200, {
      data,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        limit,
      },
    });
  }

  if ((path.endsWith("/api/inventory") || path.endsWith("/inventory")) && req.method === "POST") {
    return sendJson(res, 400, {
      message: "Validation failed.",
      errors: [{ field: "database", message: "Demo mode is read-only. Add MONGO_URI to enable writes." }],
    });
  }

  return sendJson(res, 404, { message: `Route not found: ${path}` });
};
