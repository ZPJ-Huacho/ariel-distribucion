import axios from "axios";
import { toAppError } from "./errors";

// La auth es por cookie de sesión (Auth.js). No necesitamos inyectar Bearer:
// axios envía la cookie con `withCredentials: true` al ser mismo origen.
export const privateApi = axios.create({
  baseURL: "",
  timeout: 15000,
  withCredentials: true,
});

privateApi.interceptors.response.use(
  (res) => res,
  (error) => {
    const appErr = toAppError(error);
    if (appErr.kind === "auth" && typeof window !== "undefined") {
      // Redirección centralizada al login si la sesión expiró.
      const next = window.location.pathname + window.location.search;
      window.location.assign(`/login?next=${encodeURIComponent(next)}`);
    }
    return Promise.reject(appErr);
  },
);
