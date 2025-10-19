export interface DataType {
  id: string;
  key: string;
  name: string;
  loginId: string;
  password: string;
  description: string;
  tags: string[];
}

export interface PasswordStrength {
  percent: number;
  status: 'normal' | 'success' | 'exception';
  color: string;
}

export const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25;
    if (/\d/.test(password)) score += 25;
    if (/[^a-zA-Z0-9]/.test(password)) score += 25;
    
    let status: 'normal' | 'success' | 'exception' = 'exception';
    let color = '#ff4d4f';
    
    if (score >= 75) {
      status = 'success';
      color = '#52c41a';
    } else if (score >= 50) {
      status = 'normal';
      color = '#faad14';
    }
    
    return { percent: score, status, color };
  };