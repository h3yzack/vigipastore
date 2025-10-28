import { createContext, useContext } from "react";

export interface NotificationOptions {
    message: string;
    description?: string;
    duration?: number;
}

export interface NotificationContextType {
    showSuccess: (options: NotificationOptions) => void;
    showError: (options: NotificationOptions) => void;
    showInfo: (options: NotificationOptions) => void;
    showWarning: (options: NotificationOptions) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useAppNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useAppNotification must be used within a NotificationProvider');
    }
    return context;
};