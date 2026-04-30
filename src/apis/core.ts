import { API_BASE_URL, TOKEN_KEY } from "./config";

export type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem(TOKEN_KEY);
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

  const response = await fetch(buildUrl(path, query), {
    ...requestInit,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...headers,
    },
  });

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
