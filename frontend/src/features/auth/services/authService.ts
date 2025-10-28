import * as api from "@/api/authApi";
import type { LoginFormData, LoginInfo, LoginStartRequest, RegisterFormData } from "@/common/types/userInfo";
import { fromSafeUrlStrToBase64, toStrUrlSafeBase64 } from "@/common/utils/appUtils";
import {
    clearMemory,
    clientFinishLogin,
    clientFinishRegistration,
    clientStartLogin,
    clientStartRegistration,
    deriveMasterKey,
    deriveVaultKeys,
    getDecryptedVaultKey,
} from "@/common/utils/cryptoClient";

export async function register(formData: RegisterFormData) {
    try {
        // await generateEccKeyPair();

        const { registrationRequest, clientRegistrationState } = await clientStartRegistration(formData.password);

        if (!registrationRequest || !clientRegistrationState) {
            return false;
        }

        const { registrationResponse } = await api.registerUserStartRequest({
            email: formData.email,
            registrationRequest: registrationRequest,
        });

        // finish registration
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { registrationRecord } = await clientFinishRegistration(
            formData.email,
            clientRegistrationState,
            registrationResponse
        );

        const derivedVaultKeys = await deriveVaultKeys(formData.email, formData.password);

        // await clearMemory(derivedVaultKeys.masterKey, derivedVaultKeys.vaultKey);

        const regiserPayload = {
            userInfo: {
                fullName: formData.fullName,
                email: formData.email,
            },
            masterKeySalt: toStrUrlSafeBase64(derivedVaultKeys.masterKeySalt!),
            encryptedVaultKey: toStrUrlSafeBase64(derivedVaultKeys.vaultKeyEncrypted!),
            vaultKeyNonce: toStrUrlSafeBase64(derivedVaultKeys.vaultKeyNonce!),
            masterKeyVerifier: registrationRecord,
        };

        const response = await api.finalizeUserRegister(regiserPayload);

        return response.status;
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
}

export async function processLogin(formData: LoginFormData): Promise<LoginInfo | boolean> {
    try {
        const { clientLoginState, startLoginRequest } = await clientStartLogin(formData.password);

        if (!startLoginRequest || !clientLoginState) {
            return false;
        }

        // call login start api
        const loginStartRequest: LoginStartRequest = {
            email: formData.email,
            loginRequest: startLoginRequest,
        };
        const { loginResponse } = await api.loginStartRequest(loginStartRequest);

        // finish login
        const loginResult = await clientFinishLogin(formData, clientLoginState, loginResponse);

        // send to server to verify and get session token
        if (loginResult) {
            const response = await api.finalizeUserLogin({
                email: formData.email,
                finishLoginRequest: loginResult.finishLoginRequest,
            });

            if (response.status) {
                // derive master key 
                const {masterKey} = await deriveMasterKey(formData.password, fromSafeUrlStrToBase64(response.masterKeySalt));
                // decrypt vault key
                const vaultKey = await getDecryptedVaultKey(formData.email, masterKey, 
                    fromSafeUrlStrToBase64(response.encryptedVaultKey), fromSafeUrlStrToBase64(response.vaultKeyNonce));

                await clearMemory(masterKey, undefined);

                return {accessToken: response.accessToken, vaultKey, userInfo: response.userInfo}
            }

            return false;
        }
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
    return false;
}
