import axios from "axios";

const API = axios.create({
  baseURL: "https://localhost:7068/api", 
});

export default API;