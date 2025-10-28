import { useAuth } from "@/common/hook/useAuth";
import type { VaultData, VaultRecordRequest } from "@/common/types/vault";
import { decryptVaultRecord, encryptVaultEntry } from "@/common/utils/cryptoClient";
import { useCallback, useMemo } from "react";
import * as api from "@/api/vaultApi";
import { useAppNotification } from "@/common/hook/useAppNotification";

export const useVaultService = () => {
    const { userInfo, vaultKey } = useAuth();
    const { showSuccess, showError } = useAppNotification();

    const saveOrUpdateVault = useCallback(
        async (record: VaultData): Promise<boolean> => {
            const { password, ...data } = record;
            // encrypt password
            const { ciphertext, nonce } = await encryptVaultEntry(vaultKey!, { loginId: data.loginId, password: password!, userId: userInfo!.id! });

            // prepare VaultRecordRequest
            const request: VaultRecordRequest = {
                ...data,
                encryptedPassword: ciphertext,
                encryptionIv: nonce,
                userId: userInfo!.id!,
                notes: data.notes || "",
            };

            try {
                const response = await api.addOrUpdateRequest(request);
                if (response.status) {
                    showSuccess({ message: 'Vault saved successfully!' });
                    return true;
                } else {
                    showError({ message: 'Failed to save vault.', description: 'Please check your input and try again.' });
                    return false;
                }
            } catch (error) {
                console.error("Error saving or updating vault record: ", error);
                showError({ message: 'Network error.', description: 'Please check your connection and try again.' });
                return false;
            }
            
        },
        [userInfo, vaultKey, showSuccess, showError]
    );

    const getUserVaults = useCallback(async (): Promise<VaultData[]> => {
        if (!userInfo) throw new Error("User not authenticated");
        try {
            const {records} = await api.fetchUserVaults();
            if (records) {
                records.forEach((vault) => {
                    vault.key = vault.id!;
                });
            }
            return records || [];
        } catch (error) {
            console.error("Error fetching user vaults: ", error);
            showError({ message: 'Failed to fetch vaults.', description: 'Please try again later.' });
            return [];
        }
    }, [userInfo, showError]);

    const deleteUserVault = useCallback(async (id: string): Promise<boolean> => {
        if (!userInfo) throw new Error("User not authenticated");

        try {
            const response = await api.deleteVaultRecord(id);
            if (response.status) {
                showSuccess({message: "Record deleted successfully."});
            } else {
                showError({message: "Failed to delete record."});
            }
            return response.status;
        } catch (error) {
            console.error("Error deleting vault: ", error);
            showError({message: "Failed to delete record."});
            return false;
        }
    }, [userInfo, showSuccess, showError]);

    const getUserTags = useCallback(async (): Promise<string[]> => {
        if (!userInfo) throw new Error("User not authenticated");

        try {
            const tags = await api.fetchUserTags();
            return tags || [];
        } catch (error) {
            console.error("Error fetching user tags: ", error);
            showError({ message: 'Failed to fetch tags.', description: 'Please try again later.' });
            return [];
        }

        
    }, [userInfo, showError]);

    const getVaultRecordById = useCallback(async (id: string): Promise<VaultData | null> => {
        if (!userInfo) throw new Error("User not authenticated");

        try {
            const result = await api.fetchVaultRecordById(id);
            if (result.status && result.record) {
                // decrypt password
                const {password} = await decryptVaultRecord(
                    vaultKey!,
                    result.record.encryptedPassword!,
                    result.record.encryptionIv!,
                    userInfo.id!
                );

                return {...result.record, password};
            } else {
                showError({ message: 'Failed to fetch vault record.', description: 'Record not found.' });
                return null;
            }
        } catch (error) {
            console.error("Error fetching vault record by ID: ", error);
            showError({ message: 'Failed to fetch vault record.', description: 'Please try again later.' });
            return null;
        }
    }, [userInfo, showError, vaultKey]);

    const getUserVaultsByTag = useCallback(async (tag: string): Promise<VaultData[]> => {
        if (!userInfo) throw new Error("User not authenticated");
        try {
            const {records} = await api.fetchUserVaultsByTag(tag);
            if (records) {
                records.forEach((vault) => {
                    vault.key = vault.id!;
                });
            }
            return records || [];
        } catch (error) {
            console.error("Error fetching user vaults by tag: ", error);
            showError({ message: 'Failed to fetch vaults.', description: 'Please try again later.' });
            return [];
        }
    }, [userInfo, showError]);

    const searchVaultRecords = useCallback(async (query: string | null | undefined, tag: string | null): Promise<VaultData[]> => {
        if (!userInfo) throw new Error("User not authenticated");
        try {
            const {records} = await api.searchVaultRecords(query, tag);
            if (records) {
                records.forEach((vault) => {
                    vault.key = vault.id!;
                });
            }
            return records || [];
        } catch (error) {
            console.error("Error searching vault records: ", error);
            showError({ message: 'Failed to search vaults.', description: 'Please try again later.' });
            return [];
        }
    }, [userInfo, showError]);

    return useMemo(() => {
        return {
            saveOrUpdateVault,
            getUserVaults,
            deleteUserVault,
            getUserTags,
            getVaultRecordById,
            getUserVaultsByTag,
            searchVaultRecords,
        };
    }, [saveOrUpdateVault, getUserVaults, deleteUserVault, getUserTags, getVaultRecordById, getUserVaultsByTag, searchVaultRecords]);
};
