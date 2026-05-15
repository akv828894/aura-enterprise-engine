import { useCallback, useEffect, useMemo, useState } from "react";

import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { InventoryTable } from "./components/InventoryTable";
import { useDebounce } from "./hooks/useDebounce";
import { fetchAnalytics, fetchCategories, fetchInventory } from "./services/api";
import { downloadInventoryCsv } from "./utils/csv";

const initialFilters = {
  search: "",
  category: "all",
  maxStock: "850",
  minPrice: "",
  maxPrice: "",
};

const initialPagination = {
  totalRecords: 0,
  totalPages: 1,
  currentPage: 1,
  hasNextPage: false,
  limit: 50,
};

function App() {
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState("productName");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(initialPagination);
  const [categories, setCategories] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const debouncedSearch = useDebounce(filters.search, 500);

  const requestParams = useMemo(
    () => ({
      page,
      limit: 50,
      search: debouncedSearch,
      category: filters.category,
      maxStock: filters.maxStock === "850" ? "" : filters.maxStock,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sort,
    }),
    [debouncedSearch, filters.category, filters.maxPrice, filters.maxStock, filters.minPrice, page, sort],
  );

  useEffect(() => {
    const loadBaseData = async () => {
      try {
        const [categoryList, analyticsData] = await Promise.all([fetchCategories(), fetchAnalytics()]);
        setCategories(categoryList);
        setAnalytics(analyticsData);
      } catch (apiError) {
        setError(apiError.response?.data?.message || "Unable to load dashboard data.");
      } finally {
        setLoadingAnalytics(false);
      }
    };

    loadBaseData();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadInventory = async () => {
      setLoadingInventory(true);
      setError("");

      try {
        const response = await fetchInventory(requestParams, { signal: controller.signal });
        setProducts(response.data);
        setPagination(response.pagination);
      } catch (apiError) {
        if (apiError.name !== "CanceledError") {
          setError(apiError.response?.data?.message || "Unable to load inventory.");
        }
      } finally {
        setLoadingInventory(false);
      }
    };

    loadInventory();
    return () => controller.abort();
  }, [requestParams]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }, []);

  const handleSortChange = useCallback((nextSort) => {
    setSort(nextSort);
    setPage(1);
  }, []);

  const handleExport = async () => {
    setExporting(true);

    try {
      const firstPage = await fetchInventory({ ...requestParams, page: 1, limit: 500 });
      const allProducts = [...firstPage.data];

      for (let nextPage = 2; nextPage <= firstPage.pagination.totalPages; nextPage += 1) {
        const response = await fetchInventory({ ...requestParams, page: nextPage, limit: 500 });
        allProducts.push(...response.data);
      }

      downloadInventoryCsv(allProducts);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "CSV export failed.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <main>
      <header className="app-header">
        <div>
          <p>Aura Engine</p>
          <h1>Inventory Command Center</h1>
        </div>
        <div className="header-meta">
          <span>Server-side pagination</span>
          <strong>50 rows per request</strong>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <AnalyticsDashboard analytics={analytics} loading={loadingAnalytics} />

      <InventoryTable
        categories={categories}
        filters={filters}
        onFilterChange={handleFilterChange}
        products={products}
        pagination={pagination}
        sort={sort}
        onSortChange={handleSortChange}
        onPageChange={setPage}
        loading={loadingInventory}
        onExport={handleExport}
        exporting={exporting}
      />
    </main>
  );
}

export default App;
