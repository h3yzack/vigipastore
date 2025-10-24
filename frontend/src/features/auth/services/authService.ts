import * as api from "@/api/authApi";
import type { LoginFormData, LoginInfo, LoginStartRequest, RegisterFormData } from "@/common/types/userInfo";
import { fromSafeUrlStrToBase64, strToUrlSafeBase64 } from "@/common/utils/appUtils";
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

        console.log("register - registrationRequest", { registrationRequest, clientRegistrationState });
        console.log("register - clientRegistrationState", { clientRegistrationState });

        if (!registrationRequest || !clientRegistrationState) {
            return false;
        }

        const { registrationResponse } = await api.registerUserStartRequest({
            email: formData.email,
            registrationRequest: registrationRequest,
        });

        console.log("serverResp: ", registrationResponse);

        // finish registration
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { registrationRecord, exportKey } = await clientFinishRegistration(
            formData.email,
            formData.password,
            clientRegistrationState,
            registrationResponse
        );

        console.log("register - clientRegistrationFinishResult", registrationRecord);

        const derivedVaultKeys = await deriveVaultKeys(formData.email, formData.password);

        console.log("register - derived keys", derivedVaultKeys);

        // await clearMemory(derivedVaultKeys.masterKey, derivedVaultKeys.vaultKey);

        const regiserPayload = {
            userInfo: {
                fullName: formData.fullName,
                email: formData.email,
            },
            masterKeySalt: strToUrlSafeBase64(derivedVaultKeys.masterKeySalt!),
            encryptedVaultKey: strToUrlSafeBase64(derivedVaultKeys.vaultKeyEncrypted!),
            vaultKeyNonce: strToUrlSafeBase64(derivedVaultKeys.vaultKeyNonce!),
            masterKeyVerifier: registrationRecord,
        };

        console.log("register - final register payload", regiserPayload);

        const response = await api.finalizeUserRegister(regiserPayload);

        return response.status;
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
}

export async function processLogin(formData: LoginFormData): Promise<LoginInfo | boolean> {
    try {
        console.log("Start login process");
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

        console.log("clientStartLogin result:", loginResponse);

        // finish login
        const loginResult = await clientFinishLogin(formData, clientLoginState, loginResponse);

        console.log("processLogin - loginResult", loginResult);

        // send to server to verify and get session token
        if (loginResult) {
            const response = await api.finalizeUserLogin({
                email: formData.email,
                finishLoginRequest: loginResult.finishLoginRequest,
            });

            console.log("finalizeUserLogin response:", response);

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
