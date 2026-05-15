import { authStorage } from "./authStorage";
import { emitAuthChange } from "./authEvents";

export type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
};

const apiBaseUrl = import.meta.env.VITE_API_URL?.trim();

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = apiBaseUrl
    ? new URL(normalizedPath, apiBaseUrl)
    : new URL(normalizedPath, window.location.origin);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return apiBaseUrl ? url.toString() : `${url.pathname}${url.search}`;
}

const getAuthHeaders = (): Record<string, string> => {
  const token = authStorage.getToken();
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { query, headers, ...requestInit } = options;
  const authHeaders = getAuthHeaders();

  const response = await fetch(buildUrl(path, query), {
    ...requestInit,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
  });

  if (
    (response.status === 401 || response.status === 403) &&
    authHeaders.Authorization
  ) {
    authStorage.logout();
    emitAuthChange();
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const responseText = await response.text();

  if (!responseText) {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return undefined as T;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    if (!response.ok) {
      throw new Error(
        responseText || `Request failed with status ${response.status}`,
      );
    }

    throw new Error("Unexpected response format.");
  }
}
