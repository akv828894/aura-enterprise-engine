# Deployment Checklist

## Backend on Render

Create a new Web Service from this GitHub repository.

- Root directory: repository root
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`

Environment variables:

```txt
NODE_ENV=production
MONGO_URI=<MongoDB Atlas connection string>
CLIENT_ORIGIN=<Vercel frontend URL>
```

After the backend is deployed, run the seeder once from a machine that has the same `MONGO_URI`:

```bash
npm run seed
```

## Frontend on Vercel

Import the GitHub repository in Vercel.

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`

Environment variable:

```txt
VITE_API_BASE_URL=<Render backend URL>/api
```

## Final Smoke Test

```txt
<backend-url>/api/health
<backend-url>/api/inventory?search=laptop&limit=5
<backend-url>/api/analytics
```

## Backend on Vercel Alternative

The repository also includes a Vercel serverless backend entry at `api/index.js`.

Environment variable:

```txt
MONGO_URI=<MongoDB Atlas connection string>
```
