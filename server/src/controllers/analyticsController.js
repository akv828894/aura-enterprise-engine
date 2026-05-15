import { Product } from "../models/Product.js";

export const getAnalytics = async (req, res, next) => {
  try {
    const [summary] = await Product.aggregate([
      {
        $facet: {
          kpis: [
            {
              $group: {
                _id: null,
                totalSkus: { $sum: 1 },
                totalInventoryValue: { $sum: { $multiply: ["$price", "$stockQuantity"] } },
                outOfStockItems: {
                  $sum: { $cond: [{ $eq: ["$stockQuantity", 0] }, 1, 0] },
                },
              },
            },
            {
              $project: {
                _id: 0,
                totalSkus: 1,
                totalInventoryValue: { $round: ["$totalInventoryValue", 2] },
                outOfStockItems: 1,
              },
            },
          ],
          restockPriority: [
            { $match: { stockQuantity: { $gte: 0 } } },
            { $sort: { stockQuantity: 1, reorderLevel: -1 } },
            { $limit: 10 },
            {
              $project: {
                _id: 0,
                productName: 1,
                sku: 1,
                stockQuantity: 1,
                reorderLevel: 1,
              },
            },
          ],
          valuationByCategory: [
            {
              $group: {
                _id: "$category",
                totalValue: { $sum: { $multiply: ["$price", "$stockQuantity"] } },
                skuCount: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                category: "$_id",
                totalValue: { $round: ["$totalValue", 2] },
                skuCount: 1,
              },
            },
            { $sort: { totalValue: -1 } },
          ],
        },
      },
      {
        $project: {
          kpis: { $ifNull: [{ $arrayElemAt: ["$kpis", 0] }, { totalSkus: 0, totalInventoryValue: 0, outOfStockItems: 0 }] },
          restockPriority: 1,
          valuationByCategory: 1,
        },
      },
    ]);

    res.json({
      data: summary || {
        kpis: { totalSkus: 0, totalInventoryValue: 0, outOfStockItems: 0 },
        restockPriority: [],
        valuationByCategory: [],
      },
    });
  } catch (error) {
    next(error);
  }
};
