export default function root(req, res) {
  return res.status(200).json({
    service: "Aura Engine API",
    status: "ok",
    endpoints: {
      health: "/api/health",
      inventory: "/api/inventory?page=1&limit=50",
      categories: "/api/inventory/categories",
      analytics: "/api/analytics",
    },
  });
}
