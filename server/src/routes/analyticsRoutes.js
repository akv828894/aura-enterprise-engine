import { Router } from "express";
import { getAnalytics } from "../controllers/analyticsController.js";

export const analyticsRouter = Router();

analyticsRouter.get("/", getAnalytics);
