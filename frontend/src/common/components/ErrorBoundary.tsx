import React, { Component, type ReactNode } from 'react';
import { Result, Button } from 'antd';
import { useAppNotification } from "@/common/hook/useAppNotification"; 

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Result
                    status="error"
                    title="Something went wrong"
                    subTitle="An unexpected error occurred. Please try refreshing the page."
                    extra={
                        <Button type="primary" onClick={() => window.location.reload()}>
                            Reload Page
                        </Button>
                    }
                />
            );
        }

        return this.props.children;
    }
}

const ErrorBoundaryWithNotification: React.FC<Props> = ({ children }) => {
    const { showError } = useAppNotification();

    React.useEffect(() => {
        // Global error handler for unhandled promise rejections
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            console.error('Unhandled promise rejection:', event.reason);
            showError({ message: 'An unexpected error occurred.', description: 'Please try again.' });
        };

        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    }, [showError]);

    return <>
      <ErrorBoundary>{children}</ErrorBoundary>
    </>;
};

export default ErrorBoundaryWithNotification;