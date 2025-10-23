import * as api from "@/api/baseApi";
import type { LoginFormData, LoginStartRequest, RegisterFormData } from "@/common/types/userInfo";
import { toUrlSafeBase64 } from "@/common/utils/appUtils";
import {
    clearMemory,
    clientFinishLogin,
    clientFinishRegistration,
    clientStartLogin,
    clientStartRegistration,
    deriveVaultKeys,
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

        await clearMemory(derivedVaultKeys.masterKey, derivedVaultKeys.vaultKey);

        const regiserPayload = {
            userInfo: {
                fullName: formData.fullName,
                email: formData.email,
            },
            masterKeySalt: toUrlSafeBase64(derivedVaultKeys.masterKeySalt!),
            encryptedVaultKey: toUrlSafeBase64(derivedVaultKeys.vaultKeyEncrypted!),
            vaultKeyNonce: toUrlSafeBase64(derivedVaultKeys.vaultKeyNonce!),
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

export async function processLogin(formData: LoginFormData): Promise<boolean> {
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

            // TODO: store session token securely

            return response.status;
        }
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
    return false;
}
