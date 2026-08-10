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
      // Sesión expirada: llevamos al home con ?auth=login para que el modal
      // se auto-abra (ya no hay ruta /login).
      const next = window.location.pathname + window.location.search;
      window.location.assign(`/?auth=login&next=${encodeURIComponent(next)}`);
    }
    return Promise.reject(appErr);
  },
);
