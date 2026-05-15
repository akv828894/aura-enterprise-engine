import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { analyticsRouter } from "./routes/analyticsRoutes.js";
import { inventoryRouter } from "./routes/inventoryRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export const app = express();

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(",") || "http://localhost:5173",
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Aura Engine API" });
});

app.use("/api/inventory", inventoryRouter);
app.use("/api/analytics", analyticsRouter);

app.use(notFound);
app.use(errorHandler);
