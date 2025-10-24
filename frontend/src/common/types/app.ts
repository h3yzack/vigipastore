import type { LoginFormData, UserInfo } from "@/common/types/userInfo";

export interface PasswordStrength {
  percent: number;
  status: PasswordStatus;
  color: string;
  text: string;
}

export type PasswordStatus = 'normal' | 'success' | 'exception';

export interface AuthContextType {
  userInfo: UserInfo | null;
  login: (loginData: LoginFormData) => Promise<boolean>;
  logout: () => void;

  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  vaultKey: Uint8Array | null;
  setVaultKey: (key: Uint8Array | null) => void;

  isAuthenticated: boolean;
  loading: boolean;
}
