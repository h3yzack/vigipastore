export interface UserInfo {
  id?: string;
  fullName: string;
  email: string;
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
}