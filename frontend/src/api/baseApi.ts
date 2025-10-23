import { appConfig } from "@/common/appConfig";
import type {
    LoginFinishRequest,
    LoginFinishResponse,
    LoginStartRequest,
    LoginStartResponse,
    RegisterFinishRequest,
    RegisterFinishResponse,
    RegisterStartRequest,
    RegisterStartResponse,
} from "@/common/types/userInfo";
import { getApiErrorMessage } from "@/common/utils/exceptionUtils";
import axios from "axios";

const api = axios.create({
    baseURL: appConfig.API_SERVER_URL,
    withCredentials: true,
});

export async function registerUserStartRequest(request: RegisterStartRequest): Promise<RegisterStartResponse> {
    try {
        const serverResp = await api.post(appConfig.API.ENDPOINTS.REGISTER_START, {
            email: request.email,
            registration_request: request.registrationRequest,
        });

        const response: RegisterStartResponse = {
            registrationResponse: serverResp.data.registration_response,
        };

        return response;
    } catch (error: any) {
        console.error("registerUserStartRequest - error", error);
        throw new Error(getApiErrorMessage(error, "Registration failed."));
    }
}

export async function finalizeUserRegister(request: RegisterFinishRequest): Promise<RegisterFinishResponse> {
    try {
        const serverResp = await api.post(appConfig.API.ENDPOINTS.REGISTER_FINISH, {
            user_info: { full_name: request.userInfo.fullName, email: request.userInfo.email },
            master_key_salt: request.masterKeySalt,
            encrypted_vault_key: request.encryptedVaultKey,
            vault_key_nonce: request.vaultKeyNonce,
            master_key_verifier: request.masterKeyVerifier,
        });

        // const response: RegisterFinishResponse = {
        //   registrationResponse: serverResp.data.registration_response,
        // };

        return serverResp.data;
    } catch (error: any) {
        console.error("finalizeUserRegister - error", error);
        throw new Error(getApiErrorMessage(error, "Registration failed."));
    }
}

export async function loginStartRequest(request: LoginStartRequest): Promise<LoginStartResponse> {
    try {
        const response = await api.post(appConfig.API.ENDPOINTS.LOGIN_START, {
          email: request.email,
          login_request: request.loginRequest
        });

        return {loginResponse: response.data.login_response};
        
    } catch (error: any) {
        console.error("loginStartRequest - error", error);
        throw new Error(getApiErrorMessage(error, "Login failed."));
    }
}

export async function finalizeUserLogin(request: LoginFinishRequest): Promise<LoginFinishResponse> {
    try {
        const response = await api.post(appConfig.API.ENDPOINTS.LOGIN_FINISH, {
            email: request.email,
            finish_login_request: request.finishLoginRequest
        });

        return {
            status: response.data.status,
            accessToken: response.data.access_token,
            masterKeySalt: response.data.master_key_salt,
            encryptedVaultKey: response.data.encrypted_vault_key,
            vaultKeyNonce: response.data.vault_key_nonce
        };
    } catch (error: any) {
        console.error("finalizeUserLogin - error", error);
        throw new Error(getApiErrorMessage(error, "Login failed."));
    }
}
