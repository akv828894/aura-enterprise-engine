import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, Search } from "lucide-react";

import { currencyFormatter, formatDate, numberFormatter } from "../utils/formatters";

const sortableColumns = [
  { label: "Product", field: "productName" },
  { label: "SKU", field: "sku" },
  { label: "Category", field: "category" },
  { label: "Price", field: "price" },
  { label: "Stock", field: "stockQuantity" },
  { label: "Reorder", field: "reorderLevel" },
  { label: "Updated", field: "lastUpdated" },
];

export function InventoryTable({
  categories,
  filters,
  onFilterChange,
  products,
  pagination,
  sort,
  onSortChange,
  onPageChange,
  loading,
  onExport,
  exporting,
}) {
  const currentSortField = sort.replace("-", "");
  const currentSortDirection = sort.startsWith("-") ? "desc" : "asc";

  const handleSort = (field) => {
    if (currentSortField === field) {
      onSortChange(currentSortDirection === "asc" ? `-${field}` : field);
      return;
    }

    onSortChange(field === "price" || field === "stockQuantity" ? `-${field}` : field);
  };

  return (
    <section className="inventory-shell">
      <div className="inventory-toolbar">
        <div className="search-box">
          <Search size={18} aria-hidden="true" />
          <input
            value={filters.search}
            onChange={(event) => onFilterChange("search", event.target.value)}
            placeholder="Search product name or SKU"
            aria-label="Search inventory"
          />
        </div>

        <label>
          Category
          <select value={filters.category} onChange={(event) => onFilterChange("category", event.target.value)}>
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          Max stock
          <input
            type="range"
            min="0"
            max="850"
            step="10"
            value={filters.maxStock}
            onChange={(event) => onFilterChange("maxStock", event.target.value)}
          />
          <span>{filters.maxStock === "850" ? "Any" : `< ${filters.maxStock}`}</span>
        </label>

        <label>
          Price range
          <div className="split-inputs">
            <input
              type="number"
              min="0"
              value={filters.minPrice}
              onChange={(event) => onFilterChange("minPrice", event.target.value)}
              placeholder="Min"
            />
            <input
              type="number"
              min="0"
              value={filters.maxPrice}
              onChange={(event) => onFilterChange("maxPrice", event.target.value)}
              placeholder="Max"
            />
          </div>
        </label>

        <button className="export-button" type="button" onClick={onExport} disabled={exporting || loading}>
          <Download size={17} aria-hidden="true" />
          {exporting ? "Exporting" : "CSV"}
        </button>
      </div>

      <div className="table-status">
        <strong>{numberFormatter.format(pagination.totalRecords || 0)}</strong>
        <span>matching records</span>
        {loading && <span className="status-pill">Loading 50-row page</span>}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {sortableColumns.map((column) => (
                <th key={column.field}>
                  <button type="button" onClick={() => handleSort(column.field)}>
                    {column.label}
                    {currentSortField === column.field &&
                      (currentSortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  <strong>{product.productName}</strong>
                </td>
                <td>{product.sku}</td>
                <td>
                  <span className="category-chip">{product.category}</span>
                </td>
                <td>{currencyFormatter.format(product.price)}</td>
                <td className={product.stockQuantity <= product.reorderLevel ? "risk-cell" : ""}>
                  {numberFormatter.format(product.stockQuantity)}
                </td>
                <td>{numberFormatter.format(product.reorderLevel)}</td>
                <td>{formatDate(product.lastUpdated)}</td>
              </tr>
            ))}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-state">
                  No inventory records match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-bar">
        <button type="button" disabled={pagination.currentPage <= 1 || loading} onClick={() => onPageChange(pagination.currentPage - 1)}>
          <ChevronLeft size={17} aria-hidden="true" />
          Prev
        </button>
        <span>
          Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
        </span>
        <button type="button" disabled={!pagination.hasNextPage || loading} onClick={() => onPageChange(pagination.currentPage + 1)}>
          Next
          <ChevronRight size={17} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
