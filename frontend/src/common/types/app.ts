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
  setUserInfo: (info: UserInfo | null) => void;
  login: (loginData: LoginFormData) => Promise<boolean>;
  logout: () => void;

  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  vaultKey: Uint8Array | null;
  setVaultKey: (key: Uint8Array | null) => void;

  isAuthenticated: boolean;
  loading: boolean;

  timeLeft: number | null;
  showReauthPrompt: boolean;
  handleReauth: () => void;
  setUserEmail: (email: string) => void;
  userEmail: string | null;
}

export const avatarColors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#87d068', '#108ee9', '#2db7f5', '#f50'];
export const tagColors = ["magenta", "red", "volcano", "orange", "gold", "lime", "green", "cyan", "blue", "geekblue", "purple"];