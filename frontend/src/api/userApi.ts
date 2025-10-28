import { apiClient } from "@/api/baseApi";
import { getApiErrorMessage } from "@/common/utils/exceptionUtils";
import { appConfig } from "@/common/appConfig";
import type { ProfileInfoRequest, ProfileInfoResponse, ResetMasterPasswordFinishRequest, ResetMasterPasswordFinishResponse, ResetMasterPasswordStartRequest, ResetMasterPasswordStartResponse, UserAccountInfo, UserInfo } from "@/common/types/userInfo";

export async function getUserInfo(userId: string): Promise<UserInfo> {
    try {
        const response = await apiClient.get(appConfig.API.ENDPOINTS.USER_PROFILE.replace(":id", userId));
        return response.data;
    } catch (error) {
        throw new Error(getApiErrorMessage(error));
    }
}

export async function getUserRecord(userId: string): Promise<UserAccountInfo> {
    try {
        const response = await apiClient.get(appConfig.API.ENDPOINTS.USER_GET_ACCOUNT.replace(":id", userId));

        if (response.status !== 200 || !response.data) {
            throw new Error("Failed to fetch user account information.");
        }

        const data: UserAccountInfo = {
            id: response.data.id,
            email: response.data.email,
            fullName: response.data.full_name,
            twoFaStatus: response.data.two_fa_enabled,
            masterKeySalt: response.data.master_key_salt,
            encryptedVaultKey: response.data.vault_key_encrypted,
            vaultKeyNonce: response.data.vault_key_nonce,
            createdAt: response.data.created_at,
            updatedAt: response.data.updated_at,
        };

        return data;
    } catch (error) {
        throw new Error(getApiErrorMessage(error));
    }
}

export async function saveProfile(profileInfo: ProfileInfoRequest): Promise<ProfileInfoResponse> {
    try {
        const response = await apiClient.put(appConfig.API.ENDPOINTS.USER_UPDATE_PROFILE, {
            id: profileInfo.id,
            full_name: profileInfo.fullName,
            two_fa_enabled: profileInfo.twoFaStatus,
        });
        if (!response.data || !response.data.status) {
            throw new Error("Failed to update profile.");
        }

        const userInfo: UserInfo = {
            id: response.data.user.id,
            email: response.data.user.email,
            fullName: response.data.user.full_name,
            twoFaStatus: response.data.user.two_fa_enabled,
        };

        return {
            status: response.data.status,
            userInfo,
        };
    } catch (error) {
        console.error("Error saving profile:", error);
        throw new Error(getApiErrorMessage(error));
    }
}

export async function resetMasterPasswordStartRequest(request: ResetMasterPasswordStartRequest): Promise<ResetMasterPasswordStartResponse> {
    try {
        const serverResp = await apiClient.post(appConfig.API.ENDPOINTS.USER_RESET_MASTER_PWD_START, {
            email: request.email,
            registration_request: request.registrationRequest,
        });

        const response: ResetMasterPasswordStartResponse = {
            registrationResponse: serverResp.data.registration_response,
        };

        return response;
    } catch (error) {
        console.error("registerUserStartRequest - error", error);
        throw new Error(getApiErrorMessage(error, "Registration failed."));
    }
}

export async function finalizeResetMasterPassword(request: ResetMasterPasswordFinishRequest): Promise<ResetMasterPasswordFinishResponse> {
    try {
        const serverResp = await apiClient.post(appConfig.API.ENDPOINTS.USER_RESET_MASTER_PWD_FINISH, {
            user_id: request.id,
            master_key_salt: request.masterKeySalt,
            encrypted_vault_key: request.encryptedVaultKey,
            vault_key_nonce: request.vaultKeyNonce,
            master_key_verifier: request.masterKeyVerifier,
        });

        if (!serverResp.data || !serverResp.data.status) {
            throw new Error("Failed to reset master password.");
        }

        return {
            userInfo: {
                id: serverResp.data.user_info.id,
                email: serverResp.data.user_info.email,
                fullName: serverResp.data.user_info.full_name
            },
            status: serverResp.data.status,
        };
    } catch (error) {
        console.error("finalizeResetMasterPassword - error", error);
        throw new Error(getApiErrorMessage(error, "Reset master password failed."));
    }
}