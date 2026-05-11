/**
 * Centralized fetch wrapper specifying credentialed requests for HttpOnly cookies.
 */

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (process.env.NODE_ENV !== "development") {
    return "/api/v1";
  }

  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:3000/api/v1`;
  }

  return "http://localhost:3000/api/v1";
}

interface FetchConfig extends RequestInit {
  params?: Record<string, string>;
  skipAuthRetry?: boolean;
  suppressAuthRedirect?: boolean;
}

function redirectToLogin() {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

async function parseErrorBody(response: Response) {
  try {
    const body = await response.json();

    return {
      ...body,
      message:
        typeof body?.error?.message === "string"
          ? body.error.message
          : typeof body?.message === "string"
            ? body.message
            : "API request failed",
    };
  } catch {
    return { message: "API request failed" };
  }
}

function isAuthEndpoint(endpoint: string) {
  return endpoint.startsWith("/auth/");
}

async function tryRefreshSession() {
  const refreshResponse = await fetch(`${getBaseUrl()}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  return refreshResponse.ok;
}

export const apiClient = async <T>(endpoint: string, config: FetchConfig = {}): Promise<T> => {
  const {
    params,
    headers,
    skipAuthRetry = false,
    suppressAuthRedirect = false,
    ...customConfig
  } = config;

  let url = `${getBaseUrl()}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const isFormData = typeof FormData !== "undefined" && customConfig.body instanceof FormData;

  // Inject X-Agency-Id header for platform owner impersonation
  const agencyHeaders: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const activeAgencyId = localStorage.getItem("agencyos-active-agency-id");
    if (activeAgencyId) {
      agencyHeaders["X-Agency-Id"] = activeAgencyId;
    }
  }

  const response = await fetch(url, {
    ...customConfig,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...agencyHeaders,
      ...headers,
    },
    credentials: "include",
  });

  if (response.status === 401 && !skipAuthRetry && !isAuthEndpoint(endpoint)) {
    const refreshed = await tryRefreshSession();

    if (refreshed) {
      return apiClient<T>(endpoint, {
        ...config,
        skipAuthRetry: true,
      });
    }

    if (!suppressAuthRedirect) {
      redirectToLogin();
    }
  }

  if (!response.ok) {
    if (response.status === 401 && !isAuthEndpoint(endpoint) && !suppressAuthRedirect) {
      redirectToLogin();
    }

    const errorBody = await parseErrorBody(response);
    throw new Error(errorBody.message || "API request failed");
  }

  return response.json();
};
