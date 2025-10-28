
const API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL || 'http://localhost:8000';
const SERVER_PUBLIC_KEY = import.meta.env.VITE_SERVER_PUBLIC_KEY || '';

export const appConfig = {
    API_SERVER_URL,
    SERVER_PUBLIC_KEY,
    SERVER_IDENTITY: import.meta.env.SERVER_IDENTITY || 'VigiPastore',
    APP_VERSION: import.meta.env.APP_VERSION || '1.0.0',

    API: {
        SECURITY: {
            PUBLIC_PATHS: [
                '/auth/*'
            ]
        },
        ENDPOINTS: {
            LOGIN_START: '/auth/login/start',
            LOGIN_FINISH: '/auth/login/finish',
            REGISTER_START: '/auth/register/start',
            REGISTER_FINISH: '/auth/register/finish',
            USER_PROFILE: '/user/:id',
            VAULT_ADD_UPDATE: "/vault",
            VAULT_LIST_BY_USER: "/vault/user",
            VAULT_DELETE_RECORD: "/vault/:id",
            VAULT_LIST_USER_TAGS: "/vault/tags",
            VAULT_GET_RECORD_BY_ID: "/vault/user/:id",
            VAULT_SEARCH_BY_TAG: "/vault/filter/:tag",
            VAULT_SEARCH: "/vault/search",
        }
    }
};