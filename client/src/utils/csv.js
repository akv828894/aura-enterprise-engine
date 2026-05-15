const escapeCell = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);
  return /[",\n]/.test(stringValue) ? `"${stringValue.replaceAll('"', '""')}"` : stringValue;
};

export const downloadInventoryCsv = (products) => {
  const headers = [
    "Product Name",
    "SKU",
    "Category",
    "Price",
    "Cost",
    "Stock Quantity",
    "Reorder Level",
    "Last Updated",
  ];

  const rows = products.map((product) => [
    product.productName,
    product.sku,
    product.category,
    product.price,
    product.cost,
    product.stockQuantity,
    product.reorderLevel,
    new Date(product.lastUpdated).toISOString(),
  ]);

  const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `aura-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
