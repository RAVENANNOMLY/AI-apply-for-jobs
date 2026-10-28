import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const apiUrl = (path) => `${API_BASE_URL}${path}`;
