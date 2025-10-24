import { setAuthHelpers } from '@/api/baseApi';
import { AuthContext } from '@/common/hook/useAuth';
import type { AuthContextType } from '@/common/types/app';
import type { LoginFormData, LoginInfo, UserInfo } from '@/common/types/userInfo';
import { clearMemory, getTokenExpiry } from '@/common/utils/cryptoClient';
import { processLogin } from '@/features/auth/services/authService';
import React, { useCallback, useEffect, useState } from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [vaultKey, setVaultKey] = useState<Uint8Array | null>(null);

  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    if (vaultKey) clearMemory(undefined, vaultKey);
    
    setVaultKey(null);
    setAccessToken(null);
    setUserInfo(null);
    
  }, [vaultKey]);

  const login = useCallback(async (loginData: LoginFormData): Promise<boolean> => {
      try {
        const result: LoginInfo | boolean = await processLogin(loginData);

        if (result && typeof result === 'object') {
          console.log("LoginInfo: ", result);

          setAccessToken(result.accessToken);
          setUserInfo(result.userInfo);
          setVaultKey(result.vaultKey);

          return true;
        }

        return false;

      } catch (error) {
        console.error("Login error:", error);
        return false;
      }

  }, []);

  useEffect(() => {
    setLoading(false);
  }, [userInfo]);

  useEffect(() => {
    setAuthHelpers({
      getAccessToken: () => accessToken,
      onUnauthorized: logout,
    });
  }, [accessToken, logout]);

  useEffect(() => {

    if (!accessToken) return;

    const exp = getTokenExpiry(accessToken);
    if (!exp) return;

    const now = Date.now();
    const delay = exp - now - 5000; // logout 5s before expiry

    if (delay > 0) {
      const timer = setTimeout(() => {
        console.warn("Token expiring soon — auto logout triggered.");
        logout();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [accessToken, vaultKey, logout]);


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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};