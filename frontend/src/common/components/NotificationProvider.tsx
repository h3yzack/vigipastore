import { notification } from 'antd';

import { NotificationContext, type NotificationOptions } from '@/common/hook/useAppNotification';
import type { ReactNode } from 'react';

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [api, contextHolder] = notification.useNotification();

    const showSuccess = (options: NotificationOptions) => {
        api.success({
            message: options.message,
            description: options.description,
            duration: options.duration ?? 3,
        });
    };

    const showError = (options: NotificationOptions) => {
        api.error({
            message: options.message,
            description: options.description,
            duration: options.duration ?? 3,
        });
    };

    const showInfo = (options: NotificationOptions) => {
        api.info({
            message: options.message,
            description: options.description,
            duration: options.duration ?? 3,
        });
    };

    const showWarning = (options: NotificationOptions) => {
        api.warning({
            message: options.message,
            description: options.description,
            duration: options.duration ?? 3,
        });
    };

    const value = {
        showSuccess,
        showError,
        showInfo,
        showWarning,
    };

    return (
        <NotificationContext.Provider value={value}>
            {contextHolder}
            {children}
        </NotificationContext.Provider>
    );
};