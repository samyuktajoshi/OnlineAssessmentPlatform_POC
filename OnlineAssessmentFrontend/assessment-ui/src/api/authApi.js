import axios from "axios";
import { BASE_URLS } from "./config";

const userApi = axios.create({
  baseURL: BASE_URLS.user,
});

// 🔐 OPTIONAL: attach token automatically (for future protected APIs)
userApi.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

export default userApi;