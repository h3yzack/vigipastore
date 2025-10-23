import type {PasswordStatus, PasswordStrength} from "@common/types/app";

export const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25;
    if (/\d/.test(password)) score += 25;
    if (/[^a-zA-Z0-9]/.test(password)) score += 25;
    
    let status: PasswordStatus = 'exception';
    let color = '#ff4d4f';
    let text = 'Weak';
    
    if (score >= 75) {
      status = 'success';
      color = '#52c41a';
      text = 'Strong';
    } else if (score >= 50) {
      status = 'normal';
      color = '#faad14';
      text = 'Medium';
    }

    return { percent: score, status, color, text };
  };