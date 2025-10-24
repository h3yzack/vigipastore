import * as opaque from "@serenity-kit/opaque";
import sodium from "libsodium-wrappers-sumo";
import type { DerivedVaultKeys, EncryptedVaultKeys, MasterKey } from "@/common/types/secret";
import { fromSafeUrlStrToBase64, strToUrlSafeBase64 } from "@/common/utils/appUtils";
import { appConfig } from "@/common/appConfig";
import type { LoginFormData } from "@/common/types/userInfo";

import { loadLibopaque } from "@/libs/libopaque-loader";
import { jwtDecode } from "jwt-decode";

export async function clientStartRegistration(password: string) {
  const module = await loadLibopaque();

  const result = module.createRegistrationRequest({ pwdU: password });

  // M send to client, secU stored on client side for later use
  return { registrationRequest: strToUrlSafeBase64(result.M), clientRegistrationState: strToUrlSafeBase64(result.sec) };

  // const {registrationRequest, clientRegistrationState} = opaque.client.startRegistration({ password });
  // return {registrationRequest, clientRegistrationState};
}

export async function clientFinishRegistration(email: string, password: string, clientRegistrationState: string, registrationResponse: string) {
  const module = await loadLibopaque();
  const ids = { idU: email, idS: appConfig.SERVER_IDENTITY };

  const { rec, export_key } = module.finalizeRequest({
    sec: fromSafeUrlStrToBase64(clientRegistrationState),
    pub: fromSafeUrlStrToBase64(registrationResponse),
    ids: ids,
  });

  return { registrationRecord: strToUrlSafeBase64(rec), exportKey: strToUrlSafeBase64(export_key) };

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

  const { pub, sec } = module.createCredentialRequest({ pwdU: password });

  return { clientLoginState: strToUrlSafeBase64(sec), startLoginRequest: strToUrlSafeBase64(pub) };

  //   const {clientLoginState, startLoginRequest} = opaque.client.startLogin({password});

  //   console.log("startLoginRequest", startLoginRequest)

  //   console.log("Length of startLoginRequest:", fromSafeUrlBase64(startLoginRequest).length);
  //   console.log("Length of startLoginRequest:", startLoginRequest.length);
  //   return {clientLoginState, startLoginRequest};
}

export async function clientFinishLogin(formData: LoginFormData, clientLoginState: string, loginResponse: string) {
  const module = await loadLibopaque();

  const ctx = appConfig.SERVER_IDENTITY + "-" + appConfig.APP_VERSION;

  const { sk, authU, export_key } = module.recoverCredentials({
    resp: fromSafeUrlStrToBase64(loginResponse),
    sec: fromSafeUrlStrToBase64(clientLoginState),
    context: ctx,
    ids: {
      idS: appConfig.SERVER_IDENTITY,
      idU: formData.email,
    },
  });

  return { sessionKey: strToUrlSafeBase64(sk), finishLoginRequest: strToUrlSafeBase64(authU), exportKey: strToUrlSafeBase64(export_key) };

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

export async function deriveMasterKey(password: string, masterKeySalt: Uint8Array | string | null): Promise<MasterKey> {
  try {
    await sodium.ready;
    console.log("derideriveMasterKey ---");

    let salt = sodium.randombytes_buf(sodium.crypto_pwhash_argon2i_SALTBYTES);

    if (masterKeySalt) {
      if (typeof masterKeySalt == "string") {
        // convert to Uint8Array
        salt = fromSafeUrlStrToBase64(masterKeySalt);
      } else {
        salt = masterKeySalt;
      }
    }

    const opslimit = sodium.crypto_pwhash_OPSLIMIT_MODERATE;
    const memlimit = sodium.crypto_pwhash_MEMLIMIT_MODERATE;

    const masterKey = sodium.crypto_pwhash(
      32, // output length
      password, // input password
      salt, // salt
      opslimit,
      memlimit,
      sodium.crypto_pwhash_ALG_ARGON2ID13
    );

    return { masterKey, masterKeySalt: salt };
  } catch (error) {
    console.error("deriveMasterKey - error deriving master keys:", error);
    throw error;
  }
}

export async function getEncryptedVaultKey(emailAddress: string, masterKey: Uint8Array): Promise<EncryptedVaultKeys> {
  try {
    await sodium.ready;

    const vaultKey = sodium.randombytes_buf(32);

    console.log("vault key generated:", strToUrlSafeBase64(vaultKey));

    const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);

    const vaultKeyEncrypted = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      vaultKey, // message
      emailAddress, // additional data
      null, // secret nonce (unused)
      nonce,
      masterKey
    );

    return { vaultKeyEncrypted, vaultKeyNonce: nonce };

  } catch (error) {
    console.error("getEncryptedVaultKey - error generating vault key:", error);
    throw error;
  }
}

export async function getDecryptedVaultKey(emailAddress: string,masterKey: Uint8Array, encryptedVaultKey: Uint8Array, vaultKeyNonce: Uint8Array): Promise<Uint8Array> {
  try {
    await sodium.ready;

    const vaultKey = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        encryptedVaultKey,
        emailAddress,
        vaultKeyNonce,
        masterKey
      );

    return vaultKey;
  } catch (error) {
    console.error("getEncryptedVaultKey - error generating vault key:", error);
    throw error;
  }
}

export async function deriveVaultKeys(emailAddress: string, password: string): Promise<DerivedVaultKeys> {
  try {
    await sodium.ready;
    console.log("deriveVaultKeys - deriving keys for password", sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);

    const {masterKey, masterKeySalt} = await deriveMasterKey(password, null);
    console.log("master key derived:", strToUrlSafeBase64(masterKey));

    // --- Step 3: Generate random vault key ---

    const {vaultKeyEncrypted, vaultKeyNonce} = await getEncryptedVaultKey(emailAddress, masterKey);

    console.log("vault key generated:", strToUrlSafeBase64(vaultKeyEncrypted));

    await clearMemory(masterKey, undefined);

    // Return all components — caller decides which to persist or zeroize
    return {
      masterKeySalt: masterKeySalt,
      vaultKeyEncrypted: vaultKeyEncrypted,
      vaultKeyNonce: vaultKeyNonce
    };

  } catch (error) {
    console.error("deriveVaultKeys - error deriving vault keys:", error);
    throw error;
  }
}

// export async function encryptExportKey(emailAddress: string, exportKey: Uint8Array, masterKey: Uint8Array): Promise<EncryptedExportKey> {
//   await sodium.ready;

//   const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);

//   const encryptedData = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
//     exportKey, // message
//     emailAddress,      // additional data
//     null,      // secret nonce
//     nonce,
//     masterKey
//   );

//   return { encryptedData, nonce };
// }

export async function clearMemory(masterKey: Uint8Array | undefined, vaultKey: Uint8Array | undefined) {
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

export function getTokenExpiry(token: string) {
  try {
    const decoded: any = jwtDecode(token);
    return decoded.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}
