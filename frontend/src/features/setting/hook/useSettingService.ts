import { useAppNotification } from "@/common/hook/useAppNotification";
import { useAuth } from "@/common/hook/useAuth";
import { useCallback, useMemo } from "react";
import * as api from "@/api/userApi";
import type { MasterPasswordFormData, ProfileInfoRequest, ResetMasterPasswordFinishRequest } from "@/common/types/userInfo";
import { clearMemory, clientFinishRegistration, clientStartRegistration, deriveMasterKey, encryptedVaultKey, getDecryptedVaultKey } from "@/common/utils/cryptoClient";
import { fromSafeUrlStrToBase64, toStrUrlSafeBase64 } from "@/common/utils/appUtils";

export const useSettingService = () => {
    const { showSuccess, showError } = useAppNotification();
    const { userInfo, setUserInfo } = useAuth();

    const saveProfileInfo = useCallback(
        async (profileInfo: ProfileInfoRequest): Promise<boolean> => {
            try {
                const response = await api.saveProfile(profileInfo);
                if (response.status && response.userInfo) {
                    showSuccess({ message: "Profile updated successfully!" });
                    setUserInfo(response.userInfo);
                    return true;
                } else {
                    showError({ message: "Failed to update profile.", description: "Please check your input and try again." });
                    return false;
                }
            } catch (error) {
                console.error("Error saving profile info: ", error);
                // setUserInfo({ ...userInfo!, fullName: "Testing" });
                showError({ message: "Failed to update profile.", description: "Please try again later." });
                return false;
            }
        },
        [showSuccess, showError, setUserInfo]
    );

    const resetMasterPassword = useCallback(async (resetFormData: MasterPasswordFormData): Promise<boolean> => {
        try {
            // 1. get master key salt, encryptedVaultKey and vaultKeyNonce from backend
            const userRecord = await api.getUserRecord(userInfo!.id!); 

            // 2. derive master key from old password and salt
            if (!userRecord.masterKeySalt || !userRecord.encryptedVaultKey || !userRecord.vaultKeyNonce) {
                showError({ message: "Incomplete user data. Cannot reset master password." });
                return false;
            }

            const {masterKey} = await deriveMasterKey(resetFormData.currentPassword, fromSafeUrlStrToBase64(userRecord.masterKeySalt));

            // 3. decrypt vault key with old master key
            let vaultKey : Uint8Array | null = null;
            try {
                vaultKey = await getDecryptedVaultKey(userInfo!.email!, masterKey, 
                                fromSafeUrlStrToBase64(userRecord.encryptedVaultKey), fromSafeUrlStrToBase64(userRecord.vaultKeyNonce));
            } catch  {
                showError({ message: "Failed to reset your master password. Please enter the correct current password." });
                return false;
            }

            await clearMemory(masterKey, undefined);

            // 4. if success, derive new master key from new password and salt
            const {masterKey: newMasterKey, masterKeySalt: newMasterKeySalt} = await deriveMasterKey(resetFormData.newPassword, null);

            // 5. encrypt vault key with new master key
            const { vaultKeyEncrypted, vaultKeyNonce } = await encryptedVaultKey(userInfo!.email!, newMasterKey, vaultKey!, fromSafeUrlStrToBase64(userRecord.vaultKeyNonce));

            await clearMemory(newMasterKey, vaultKey);

            // 6. get registration record as new master key verifier
            const { registrationRequest, clientRegistrationState } = await clientStartRegistration(resetFormData.newPassword);

            if (!registrationRequest || !clientRegistrationState) {
                showError({ message: "Failed to reset master password.", description: "Please try again later." });
                return false;
            }

            const { registrationResponse } = await api.resetMasterPasswordStartRequest({
                        email: userInfo!.email!,
                        registrationRequest: registrationRequest,
                    });

            const { registrationRecord } = await clientFinishRegistration(
                        userInfo!.email!,
                        clientRegistrationState,
                        registrationResponse
                    );

            // 7. send to backend to update master key verifier, encryptedVaultKey and vaultKeyNonce
            const resetPayload: ResetMasterPasswordFinishRequest = {
                id: userInfo!.id!,
                masterKeySalt: toStrUrlSafeBase64(newMasterKeySalt),
                encryptedVaultKey: toStrUrlSafeBase64(vaultKeyEncrypted!),
                vaultKeyNonce: toStrUrlSafeBase64(vaultKeyNonce!),
                masterKeyVerifier: registrationRecord,
            }

            const response = await api.finalizeResetMasterPassword(resetPayload);

            if (response.status) {
                showSuccess({ message: "Master password reset successfully!" });
                return true;
            } else {
                showError({ message: "Failed to reset master password.", description: "Please try again later." });
                return false;
            }
        } catch (error) {
            console.error("Error resetting master password: ", error);
            showError({ message: "Failed to reset master password.", description: "Please try again later." });
            return false;
        }
    }, [showSuccess, showError, userInfo]);

    return useMemo(() => {
        return {
            saveProfileInfo,
            resetMasterPassword,
        };
    }, [saveProfileInfo, resetMasterPassword]);
};
