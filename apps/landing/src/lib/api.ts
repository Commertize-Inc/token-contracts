import { createApi } from "@commertize/backend/client";

const API_BASE_url = import.meta.env.VITE_API_URL || "http://localhost:3002";

export const api = createApi(API_BASE_url);
