# AI Transparency Log

This project used AI assistance as an engineering pair-programmer for planning and implementation support.

## Interaction 1: Backend Query and Aggregation Design

**Goal:** Design an Express and MongoDB API that can handle a 50,000 SKU inventory dataset without loading all records into application memory.

**Prompt summary:** Asked for a production-style API shape with server-side pagination, indexed filters, sorting, and aggregation pipelines for KPI cards, low-stock risk chart, and category valuation chart.

**Engineering decisions kept by the developer:**

- Inventory reads use `page`, `limit`, filters, and `sort`, then return pagination metadata.
- Analytics use MongoDB aggregation with `$facet`, `$group`, `$match`, and `$project`.
- Product model includes indexes on `sku`, `category`, `productName`, plus compound/indexes for frequent table filters.
- Validation blocks negative stock and rejects products where `price < cost`.

## Interaction 2: Frontend Data Grid UX

**Goal:** Build a React dashboard that stays responsive with large datasets.

**Prompt summary:** Asked for a practical enterprise dashboard layout with debounced search, column filters, sticky sortable table headers, server-side pagination, charts, and CSV export.

**Engineering decisions kept by the developer:**

- Search is debounced for 500ms before calling the API.
- The browser renders only the current page of results.
- CSV export uses the active filters and sort order, fetching the filtered result set in 500-row batches.
- Charts are built with Recharts and consume the backend's aggregation output directly.
