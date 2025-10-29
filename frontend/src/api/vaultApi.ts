import { appConfig } from "@/common/appConfig";
import type { VaultData, VaultRecordRequest, VaultRecordResponse } from "@/common/types/vault";
import { getApiErrorMessage } from "@/common/utils/exceptionUtils";
import { apiClient } from "@/api/baseApi";

export async function addOrUpdateRequest(request: VaultRecordRequest): Promise<VaultRecordResponse> {
    try {
        const serverResp = await apiClient.post(appConfig.API.ENDPOINTS.VAULT_ADD_UPDATE, {
            id: request.id,
            user_id: request.userId,
            title: request.title,
            login_id: request.loginId,
            notes: request.notes,
            password_ciphertext: request.encryptedPassword,
            encryption_iv: request.encryptionIv,
            tags: request.tags
        });

      //   const response: RegisterStartResponse = {
      //       registrationResponse: serverResp.data.registration_response,
      //   };

        return serverResp.data;
    } catch (error) {
        console.error("registerUserStartRequest - error", error);
        throw new Error(getApiErrorMessage(error, "Registration failed."));
    }
}

export async function fetchUserVaults(): Promise<VaultRecordResponse> {
    try {
        const serverResp = await apiClient.get(appConfig.API.ENDPOINTS.VAULT_LIST_BY_USER);

        if (!serverResp.data || !serverResp.data.status) {
            throw new Error("Failed to fetch vault records.");
        }

        const records = serverResp.data.records.map((record: any) => {
            return {
                id: record.id,
                userId: record.user_id,
                title: record.title,
                loginId: record.login_id,
                notes: record.notes,
                encryptedPassword: record.password_ciphertext,
                encryptionIv: record.encryption_iv,
                tags: record.tags,
            };
        });

        return {
            status: serverResp.data.status,
            records,
        };
    } catch (error) {
        console.error("fetchUserVaults - error", error);
        throw new Error(getApiErrorMessage(error, "Failed to fetch vault records."));
    }
}

export async function deleteVaultRecord(id: string): Promise<VaultRecordResponse> {
    try {
        const serverResp = await apiClient.delete(appConfig.API.ENDPOINTS.VAULT_DELETE_RECORD.replace(':id', id));

        return serverResp.data;
    } catch (error) {
        console.error("deleteVaultRecord - error", error);
        throw new Error(getApiErrorMessage(error, "Failed to delete vault record."));
    }
}

export async function fetchUserTags(): Promise<string[]> {
    try {
        const serverResp = await apiClient.get(appConfig.API.ENDPOINTS.VAULT_LIST_USER_TAGS);

        return serverResp.data.tags;
    } catch (error) {
        console.error("fetchUserTags - error", error);
        throw new Error(getApiErrorMessage(error, "Failed to fetch vault tags."));
    }
} 

export async function fetchVaultRecordById(id: string): Promise<VaultRecordResponse> {
    try {
        const serverResp = await apiClient.get(appConfig.API.ENDPOINTS.VAULT_GET_RECORD_BY_ID.replace(':id', id));

        if (!serverResp.data || typeof serverResp.data.status !== 'boolean') {
            throw new Error("Invalid response from server.");
        }

        const record = transformRawRecord(serverResp.data.record);

        return {
            status: serverResp.data.status,
            record,
        };
    } catch (error) {
        console.error("fetchVaultRecordById - error", error);
        throw new Error(getApiErrorMessage(error, "Failed to fetch vault record."));
    }
}

export async function fetchUserVaultsByTag(tag: string): Promise<VaultRecordResponse> {
    try {
        const serverResp = await apiClient.get(appConfig.API.ENDPOINTS.VAULT_SEARCH_BY_TAG.replace(':tag', encodeURIComponent(tag)));

        if (!serverResp.data || !serverResp.data.status) {
            throw new Error("Failed to fetch vault records.");
        }

        const records = serverResp.data.records.map((record: any) => {
            return transformRawRecord(record);
        });

        return {
            status: serverResp.data.status,
            records,
        };
    } catch (error) {
        console.error("fetchUserVaults - error", error);
        throw new Error(getApiErrorMessage(error, "Failed to fetch vault records."));
    }
}

export async function searchVaultRecords(query: string | null | undefined, tag: string | null): Promise<VaultRecordResponse> {
    try {
        const serverResp = await apiClient.get(appConfig.API.ENDPOINTS.VAULT_SEARCH, {
            params: { query, tag },
        });

        if (!serverResp.data || !serverResp.data.status) {
            throw new Error("Failed to search vault records.");
        }

        const records = serverResp.data.records.map((record: any) => {
            return transformRawRecord(record);
        });

        return {
            status: serverResp.data.status,
            records,
        };
    } catch (error) {
        console.error("searchVaults - error", error);
        throw new Error(getApiErrorMessage(error, "Failed to search vault records."));
    }
}

const transformRawRecord = (rawRecord: any): VaultData | undefined => {
    if (!rawRecord) return undefined;

    return {
        id: rawRecord.id,
        userId: rawRecord.user_id,
        title: rawRecord.title,
        loginId: rawRecord.login_id,
        notes: rawRecord.notes,
        encryptedPassword: rawRecord.password_ciphertext,
        encryptionIv: rawRecord.encryption_iv,
        tags: rawRecord.tags || [],
    };
};