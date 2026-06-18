import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { locales, defaultLocale, LOCALE_COOKIE } from "@/shared/config/i18n";

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== "undefined" && value instanceof FormData;
}

/**
 * Reads the active locale from the NEXT_LOCALE cookie (the same cookie the
 * `setLocale` server action writes). Used to tell the backend which language
 * to localize its responses in via the Accept-Language header.
 */
function getClientLocale(): string {
  if (typeof document === "undefined") return defaultLocale;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`),
  );
  const value = match?.[1];
  return value && (locales as readonly string[]).includes(value)
    ? value
    : defaultLocale;
}

function setContentTypeHeader(
  config: InternalAxiosRequestConfig,
  value: string,
): void {
  if (typeof config.headers?.set === "function") {
    config.headers.set("Content-Type", value);
    return;
  }
  (config.headers as Record<string, unknown>)["Content-Type"] = value;
}

function deleteContentTypeHeader(config: InternalAxiosRequestConfig): void {
  if (typeof config.headers?.delete === "function") {
    config.headers.delete("Content-Type");
    return;
  }
  delete (config.headers as Record<string, unknown>)["Content-Type"];
}

class HttpModule {
  private readonly instance: AxiosInstance;

  constructor(baseURL: string, timeout: number = 50000) {
    this.instance = axios.create({
      baseURL,
      timeout,
      // Sanctum SPA mode: send the session + XSRF cookies with every request,
      // and let axios mirror the XSRF-TOKEN cookie into the X-XSRF-TOKEN header.
      withCredentials: true,
      // Required since axios 1.6: cookie->header XSRF mirroring is skipped for
      // cross-origin requests (frontend :3000 -> backend :8000) unless this is
      // explicitly true. Without it Laravel rejects logins with a CSRF mismatch.
      withXSRFToken: true,
      xsrfCookieName: "XSRF-TOKEN",
      xsrfHeaderName: "X-XSRF-TOKEN",
    });

    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        // Note: Content-Security-Policy is a *response* header and is ignored
        // when sent on a request, so it is intentionally not set here. CSP must
        // be configured server-side (e.g. Next.js headers / backend response).
        config.headers.set("X-Request-ID", crypto.randomUUID());
        // Forward the active UI locale so the backend localizes its responses
        // (validation/error messages) to match. Server-side requests set this
        // explicitly in getServerHttpClient() instead.
        if (typeof window !== "undefined") {
          config.headers.set("Accept-Language", getClientLocale());
          const token = localStorage.getItem("auth_token");
          if (token) {
            config.headers.set("Authorization", `Bearer ${token}`);
          }
        }
        if (!isFormData(config.data)) {
          setContentTypeHeader(config, "application/json");
        } else {
          deleteContentTypeHeader(config);
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error),
    );

    this.instance.interceptors.response.use(
      (response: AxiosResponse): AxiosResponse => {
        return response;
      },
      (error: AxiosError) => {
        // There is no token refresh: a 401 (e.g. expired token) is propagated
        // so the global error handler (TanStack Query's QueryCache/MutationCache
        // via handleApiError) can clear auth and redirect to login.
        return Promise.reject(error);
      },
    );
  }

  getInstance(): AxiosInstance {
    return this.instance;
  }
}

export default HttpModule;
