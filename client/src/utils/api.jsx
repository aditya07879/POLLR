import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Voter token for duplicate vote prevention (no login required)
const getVoterToken = () => {
  let t = localStorage.getItem("voterToken");
  if (!t) {
    t = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("voterToken", t);
  }
  return t;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  config.headers["x-voter-token"] = getVoterToken();
  return config;
});

export default api;
