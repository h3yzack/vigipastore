import { setAuthHelpers } from "@/api/baseApi";
import { AuthContext } from "@/common/hook/useAuth";
import type { AuthContextType } from "@/common/types/app";
import type { LoginFormData, LoginInfo, UserInfo } from "@/common/types/userInfo";
import { clearMemory, getTokenExpiry } from "@/common/utils/cryptoClient";
import PasswordPromptModal from "@/components/PasswordPromptModal";
import { processLogin } from "@/features/auth/services/authService";
import { Modal } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";

// Constants
const REAUTH_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes
const TICK_INTERVAL_MS = 30 * 1000; // 30 seconds
const LOGOUT_BUFFER_MS = 5000; // 5 seconds before expiry

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // Auth state
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [vaultKey, setVaultKey] = useState<Uint8Array | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // UI state
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [showReauthPrompt, setShowReauthPrompt] = useState(false);

    // Refs
    const hasShownPromptRef = useRef(false);

    // Helper functions
    const resetAuthState = useCallback(() => {
        if (vaultKey) clearMemory(undefined, vaultKey);
        setVaultKey(null);
        setAccessToken(null);
        setUserInfo(null);
        setUserEmail(null);
        setShowReauthPrompt(false);
        setTimeLeft(null);
        hasShownPromptRef.current = false;
    }, [vaultKey]);

    const setupTokenExpiryManagement = useCallback((token: string) => {
        const exp = getTokenExpiry(token);
        console.log("Token expiry time (ms): ", exp);
        if (!exp) return;

        const now = Date.now();
        const delay = exp - now - LOGOUT_BUFFER_MS;

        if (delay > 0) {
            const logoutTimer = setTimeout(() => {
                console.warn("Token expiring soon — auto logout triggered.");
                resetAuthState();
            }, delay);

            const tick = () => {
                const remaining = exp - Date.now();
                setTimeLeft(remaining > 0 ? remaining : 0);

                if (remaining <= REAUTH_THRESHOLD_MS && remaining > 0 && !hasShownPromptRef.current) {
                    hasShownPromptRef.current = true;
                    setShowReauthPrompt(true);
                }
            };

            tick();
            const interval = setInterval(tick, TICK_INTERVAL_MS);

            return () => {
                clearTimeout(logoutTimer);
                clearInterval(interval);
            };
        } else {
            resetAuthState();
        }
    }, [resetAuthState]);

    const logout = useCallback(() => {
        resetAuthState();
    }, [resetAuthState]);

    const login = useCallback(async (loginData: LoginFormData): Promise<boolean> => {
        try {
            console.log("Login Data: ", loginData);
            const result: LoginInfo | boolean = await processLogin(loginData);

            if (result && typeof result === "object") {
                console.log("LoginInfo: ", result);

                setAccessToken(result.accessToken);
                setUserInfo(result.userInfo);
                setVaultKey(result.vaultKey);
                setUserEmail(loginData.email);

                return true;
            }

            return false;
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    }, []);

    // Effects
    useEffect(() => {
        setLoading(false);
    }, [userInfo]);

    useEffect(() => {
        setAuthHelpers({
            getAccessToken: () => accessToken,
            onUnauthorized: logout,
        });
    }, [accessToken, logout]);

    // Close other modals when re-auth prompt opens
    useEffect(() => {
        if (showReauthPrompt) {
            Modal.destroyAll();
        }
    }, [showReauthPrompt]);

    useEffect(() => {
        if (!accessToken) {
            setTimeLeft(null);
            setShowReauthPrompt(false);
            hasShownPromptRef.current = false;
            return;
        }

        return setupTokenExpiryManagement(accessToken);
    }, [accessToken, setupTokenExpiryManagement]);

    // ---- Handle Re-auth ----
    const handleReauth = useCallback(() => {
        setShowReauthPrompt(false);
        hasShownPromptRef.current = false;
    }, []);

    const handleReauthCancel = useCallback(() => {
        setShowReauthPrompt(false);
        hasShownPromptRef.current = false;
    }, []);

    const value: AuthContextType = {
        userInfo,
        accessToken,
        setAccessToken,
        vaultKey,
        setVaultKey,
        login,
        logout,
        isAuthenticated: !!userInfo,
        loading,
        timeLeft,
        showReauthPrompt,
        handleReauth,
        setUserEmail,
        userEmail
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            <PasswordPromptModal
                visible={showReauthPrompt}
                onSubmit={handleReauth}
                onCancel={handleReauthCancel}
                timeLeft={timeLeft}
            />
        </AuthContext.Provider>
    );
};
