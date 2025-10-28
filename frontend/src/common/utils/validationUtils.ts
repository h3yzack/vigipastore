import type { PasswordStatus, PasswordStrength } from "@/common/types/app";

export const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
        return { percent: 0, status: "exception", color: "#ff4d4f", text: "Weak" };
    }
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25;
    if (/\d/.test(password)) score += 25;
    if (/[^a-zA-Z0-9]/.test(password)) score += 25;

    let status: PasswordStatus = "exception";
    let color = "#ff4d4f";
    let text = "Weak";
    let percent = 0;

    if (score >= 75) {
        status = "success";
        color = "#52c41a";
        text = "Strong";
        percent = 100;  // Set to 100% for strong passwords
    } else if (score >= 50) {
        status = "normal";
        color = "#faad14";
        text = "Medium";
        percent = 75;  // Set to 75% for medium
    } else {
        percent = 25;  // Set to 25% for weak
    }

    return { percent, status, color, text };
};
