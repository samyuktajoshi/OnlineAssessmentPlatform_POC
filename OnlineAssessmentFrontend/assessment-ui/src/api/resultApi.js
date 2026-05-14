import axios from "axios";
import { BASE_URLS } from "./config";

const resultApi = axios.create({
  baseURL: BASE_URLS.result,
});

resultApi.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

export default resultApi;