# Aura Engine

Aura Engine is a full-stack inventory command center built for high-volume warehouse teams. It supports server-side pagination, advanced filtering, debounced search, MongoDB aggregation analytics, and filtered CSV export.

## Tech Stack

- React + Vite
- Recharts
- Node.js + Express
- MongoDB + Mongoose
- Zod validation
- Faker-powered 50,000 product seeder

## Features

- 50-row server-side inventory pagination
- Debounced global search with a 500ms delay
- Category, stock, and price filters
- Sticky sortable data grid columns
- CSV export for the active filtered dataset
- KPI cards for total SKUs, inventory value, and stockouts
- Bar chart for the lowest-stock restock priorities
- Pie chart for inventory valuation by category
- Product validation for create/update routes

## Local Setup

1. Install root dependencies:

```bash
npm install
```

2. Install frontend dependencies:

```bash
cd client
npm install
```

3. Create environment files:

```bash
copy .env.example .env
copy client\.env.example client\.env
```

4. Start MongoDB locally, then seed data:

```bash
npm run seed
```

The seeder creates 50,000 realistic products and syncs MongoDB indexes.

5. Start the backend:

```bash
npm run dev
```

6. Start the frontend in another terminal:

```bash
cd client
npm run dev
```

## API

### `GET /api/inventory`

Example:

```http
GET /api/inventory?page=1&limit=50&search=audio&category=Electronics&sort=-price
```

Returns:

- `data`: paginated products
- `pagination.totalRecords`
- `pagination.totalPages`
- `pagination.currentPage`
- `pagination.hasNextPage`

### `GET /api/analytics`

Returns:

- `kpis`
- `restockPriority`
- `valuationByCategory`

### `POST /api/inventory`

Creates a product. Rejects invalid business data with `400 Bad Request`.

### `PUT /api/inventory/:id`

Updates a product. Rejects negative stock and `price < cost`.

## Demo Checklist

- Open Network tab and show `/api/inventory` returning only 50 products.
- Search a term and pause to show the 500ms debounced request behavior.
- Change category, stock, and price filters.
- Sort by price or stock.
- Export CSV from the filtered table.
- Open Postman and test:

```http
GET /api/inventory?search=laptop&limit=5
GET /api/analytics
```

## Deployment Notes

Backend environment variables:

- `PORT`
- `MONGO_URI`
- `CLIENT_ORIGIN`

Frontend environment variables:

- `VITE_API_BASE_URL`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the Render and Vercel checklist.
