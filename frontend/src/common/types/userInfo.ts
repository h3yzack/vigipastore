export interface UserInfo {
  id?: string;
  fullName: string;
  email: string;
  twoFaStatus?: boolean;
}

export interface UserAccountInfo {
  id: string;
  email: string;
  fullName: string;
  twoFaStatus: boolean;
  masterKeySalt: string;
  encryptedVaultKey: string;
  vaultKeyNonce: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterStartRequest {
    email: string;
    registrationRequest: string;
}

export interface RegisterStartResponse {
    registrationResponse: string;
}

export interface RegisterFinishRequest {
    userInfo: UserInfo;
    masterKeySalt: string;
    encryptedVaultKey: string;
    vaultKeyNonce: string;
    masterKeyVerifier: string;
}

export interface RegisterFinishResponse {
    userInfo?: UserInfo;
    status: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginStartRequest {
  email: string;
  loginRequest: string;
}

export interface LoginStartResponse {
  loginResponse: string;
}

export interface LoginFinishRequest {
  email: string;
  finishLoginRequest: string;
}

export interface LoginFinishResponse {
  status: boolean;
  accessToken: string;
  masterKeySalt: string;
  encryptedVaultKey: string;
  vaultKeyNonce: string;
  userInfo: UserInfo;
}

export interface LoginInfo {
  accessToken: string;
  vaultKey: Uint8Array;
  userInfo: UserInfo;
}

export interface ProfileInfoRequest {
  fullName: string;
  id: string;
  twoFaStatus: boolean;
}

export interface ProfileInfoResponse {
  userInfo: UserInfo;
  status: boolean;
}

export interface MasterPasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetMasterPasswordStartRequest {
    email: string;
    registrationRequest: string;
}

export interface ResetMasterPasswordStartResponse {
    registrationResponse: string;
}

export interface ResetMasterPasswordFinishRequest {
    id: string;
    masterKeySalt: string;
    encryptedVaultKey: string;
    vaultKeyNonce: string;
    masterKeyVerifier: string;
}

export interface ResetMasterPasswordFinishResponse {
    userInfo?: UserInfo;
    status: boolean;
}