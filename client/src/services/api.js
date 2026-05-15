import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 15000,
});

export const fetchInventory = async (params, config = {}) => {
  const response = await api.get("/inventory", { ...config, params });
  return response.data;
};

export const fetchCategories = async () => {
  const response = await api.get("/inventory/categories");
  return response.data.data;
};

export const fetchAnalytics = async () => {
  const response = await api.get("/analytics");
  return response.data.data;
};
