import * as opaque from "@serenity-kit/opaque";
import sodium from "libsodium-wrappers-sumo";
import type { DerivedVaultKeys, EncryptedExportKey } from "../types/secret";
import { fromSafeUrlBase64, toUrlSafeBase64 } from "./appUtils";
import { appConfig } from "../appConfig";
import type { LoginFormData } from "../types/userInfo";

import { loadLibopaque } from "@/libs/libopaque-loader";


export async function clientStartRegistration(password: string) {

    const module = await loadLibopaque();

    const result = module.createRegistrationRequest({ pwdU: password });

    // M send to client, secU stored on client side for later use
    return {registrationRequest: toUrlSafeBase64(result.M), clientRegistrationState: toUrlSafeBase64(result.sec)};

    // const {registrationRequest, clientRegistrationState} = opaque.client.startRegistration({ password });
    // return {registrationRequest, clientRegistrationState};
}

export async function clientFinishRegistration(email: string, password: string, clientRegistrationState: string, registrationResponse: string) {

    const module = await loadLibopaque();
    const ids = { idU: email, idS: appConfig.SERVER_IDENTITY };

    const {rec, export_key} = module.finalizeRequest({
        sec: fromSafeUrlBase64(clientRegistrationState),
        pub: fromSafeUrlBase64(registrationResponse),
        ids: ids
    });

    return {registrationRecord: toUrlSafeBase64(rec), exportKey: toUrlSafeBase64(export_key)};

    // const identifiers = { client: email, server: appConfig.SERVER_IDENTITY };
    // const {registrationRecord, exportKey} = opaque.client.finishRegistration({
    //     password,
    //     registrationResponse,
    //     clientRegistrationState,
    //     identifiers
    // });

    // return {registrationRecord, exportKey};
}

export async function clientStartLogin(password: string): Promise<opaque.client.StartLoginResult> {
  const module = await loadLibopaque();

  console.log("Starting login with password.", password);

  const {pub, sec} = module.createCredentialRequest({pwdU: password});

  return {clientLoginState: toUrlSafeBase64(sec), startLoginRequest: toUrlSafeBase64(pub)};

//   const {clientLoginState, startLoginRequest} = opaque.client.startLogin({password});

//   console.log("startLoginRequest", startLoginRequest)

//   console.log("Length of startLoginRequest:", fromSafeUrlBase64(startLoginRequest).length);
//   console.log("Length of startLoginRequest:", startLoginRequest.length);
//   return {clientLoginState, startLoginRequest};
}

export async function clientFinishLogin(formData: LoginFormData, clientLoginState: string, loginResponse: string) {
    const module = await loadLibopaque();

    const ctx = appConfig.SERVER_IDENTITY + "-" + appConfig.APP_VERSION;

    const {sk, authU, export_key} = module.recoverCredentials({
        resp: fromSafeUrlBase64(loginResponse),
        sec: fromSafeUrlBase64(clientLoginState),
        context: ctx,
        ids: {
            idS: appConfig.SERVER_IDENTITY,
            idU: formData.email
        }
    });

    return {sessionKey: toUrlSafeBase64(sk), finishLoginRequest: toUrlSafeBase64(authU), exportKey: toUrlSafeBase64(export_key)};

    
    // const identifiers = { client: formData.email, server: appConfig.SERVER_IDENTITY };
    // const loginResult = opaque.client.finishLogin({
    //     clientLoginState,
    //     loginResponse,
    //     password: formData.password,
    //     identifiers
    // });

    // console.log("clientFinishLogin - loginResult", loginResult);

    // return loginResult;
}

export async function deriveVaultKeys(emailAddress: string, password: string): Promise<DerivedVaultKeys> {

    try {
        await sodium.ready;
        console.log("deriveVaultKeys - deriving keys for password", sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);

        // --- Step 1: Generate salt for master key ---
        const masterKeySalt = sodium.randombytes_buf(sodium.crypto_pwhash_argon2i_SALTBYTES);

        // --- Step 2: Derive master key using Argon2id ---
        const opslimit = sodium.crypto_pwhash_OPSLIMIT_MODERATE;
        const memlimit = sodium.crypto_pwhash_MEMLIMIT_MODERATE;

        const masterKey = sodium.crypto_pwhash(
            32, // output length
            password, // input password
            masterKeySalt, // salt
            opslimit,
            memlimit,
            sodium.crypto_pwhash_ALG_ARGON2ID13
        );

        // --- Step 3: Generate random vault key ---
        const vaultKey = sodium.randombytes_buf(32);

        console.log("vault key generated:", toUrlSafeBase64(vaultKey));

        // --- Step 4: Encrypt vault key under master key ---
        const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);

        const vaultKeyEncrypted = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
            vaultKey, // message
            emailAddress, // additional data
            null, // secret nonce (unused)
            nonce,
            masterKey
        );

        // Return all components — caller decides which to persist or zeroize
        return {
            masterKeySalt: masterKeySalt,
            vaultKeyEncrypted: vaultKeyEncrypted,
            vaultKeyNonce: nonce,
            masterKey: masterKey,
            vaultKey: vaultKey,
        };
    } catch (error) {
        console.error("deriveVaultKeys - error deriving vault keys:", error);
        throw error;
    }
}

export async function encryptExportKey(emailAddress: string, exportKey: Uint8Array, masterKey: Uint8Array): Promise<EncryptedExportKey> {
  await sodium.ready;

  const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);

  const encryptedData = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    exportKey, // message
    emailAddress,      // additional data
    null,      // secret nonce
    nonce,
    masterKey
  );

  return { encryptedData, nonce };
}

export async function clearMemory(masterKey: Uint8Array, vaultKey: Uint8Array | undefined) {
  if (masterKey) {
    sodium.memzero(masterKey);
  }
  if (vaultKey) {
    sodium.memzero(vaultKey);
  }
}


export async function generateEccKeyPair(): Promise<sodium.KeyPair> {
    await sodium.ready;
    const keyPair = sodium.crypto_box_keypair();

    const curve25519PublicKey = keyPair.publicKey;
    const curve25519PrivateKey = keyPair.privateKey;

    console.log("length of private key:", curve25519PrivateKey.length);
    console.log("length of public key:", curve25519PublicKey.length);

    console.log("publicKey:", sodium.to_base64(curve25519PublicKey, sodium.base64_variants.URLSAFE_NO_PADDING));
    console.log("privateKey:", sodium.to_base64(curve25519PrivateKey, sodium.base64_variants.URLSAFE_NO_PADDING));

    return keyPair;
}