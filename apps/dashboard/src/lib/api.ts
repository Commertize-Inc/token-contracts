import { createApi } from "@commertize/backend/client";

const API_BASE_url = import.meta.env.VITE_API_URL || "http://127.0.0.1:3002";

export const api = createApi(API_BASE_url);
