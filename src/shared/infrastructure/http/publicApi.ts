import axios from "axios";
import { toAppError } from "./errors";

export const publicApi = axios.create({
  baseURL: "",
  timeout: 15000,
  withCredentials: true,
});

publicApi.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(toAppError(error)),
);
