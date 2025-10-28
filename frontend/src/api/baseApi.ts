import { appConfig } from "@/common/appConfig";
import axios from "axios";

let getAccessToken: (() => string | null) | null = null;
let onUnauthorized: (() => void) | null = null;

export const setAuthHelpers = (helpers: {
    getAccessToken: () => string | null;
    onUnauthorized: () => void;
}) => {
    getAccessToken = helpers.getAccessToken;
    onUnauthorized = helpers.onUnauthorized;
};

function isPublicEndpoint(url: string): boolean {
    const publicEndpoints = appConfig.API.SECURITY.PUBLIC_PATHS;

    const path = url.replace(/^https?:\/\/[^/]+/, "").split("?")[0];

    return publicEndpoints.some((prefix) => {
        const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escape regex chars
        const regex = new RegExp("^" + escapedPrefix.replace("\\*", ".*") + "$");
        return regex.test(path);
    });
}

// ---------------------------------------------------------
//  Axios client setup
// ---------------------------------------------------------
export const apiClient = axios.create({
    baseURL: appConfig.API_SERVER_URL,
    withCredentials: true,
    timeout: 10000,
});

// Request Interceptor
apiClient.interceptors.request.use(
    (config) => {
        const accessToken = getAccessToken ? getAccessToken() : null;
        const url = config.url || "";
        const isPublic = isPublicEndpoint(url);

        if (accessToken && config.url && !isPublic) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && onUnauthorized) {
            console.warn("Unauthorized or expired token — logging out");
            onUnauthorized(); // call logout()
        }
        return Promise.reject(error);
    }
);