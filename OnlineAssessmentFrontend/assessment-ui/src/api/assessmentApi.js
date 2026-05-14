import axios from "axios";
import { BASE_URLS } from "./config";

const assessmentApi = axios.create({
  baseURL: BASE_URLS.assessment,
});

assessmentApi.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

export default assessmentApi;