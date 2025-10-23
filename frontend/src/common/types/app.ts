export interface PasswordStrength {
  percent: number;
  status: PasswordStatus;
  color: string;
  text: string;
}

export type PasswordStatus = 'normal' | 'success' | 'exception';