import { useAuth } from "@/common/hook/useAuth";
import { Form, Input, Modal, notification } from "antd";
import { useState } from "react";
import {WarningOutlined} from "@ant-design/icons"

interface PasswordPromptModalProps {
    timeLeft: number | null;
    onSubmit: () => void;
    onCancel: () => void;
    visible: boolean;
}

export default function PasswordPromptModal({ visible, onSubmit, onCancel, timeLeft }: PasswordPromptModalProps) {
    const [form] = Form.useForm();
    const totalSeconds = Math.floor((timeLeft ?? 0) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const [loading, setLoading] = useState(false);
    const { userEmail } = useAuth();
    const { login } = useAuth();
    const [api, contextHolder] = notification.useNotification();

    const showSuccessNotification = () => {
        api.info({
            message: 'Status',
            description: "Login success! Your session has been extended.",
            duration: 3,
            showProgress: true,
        });
    };

    const showErrorNotification = () => {
        api.error({
            message: 'Status',
            description: "Login failed. Please try again.",
            duration: 2,
            showProgress: true,
        });
    };

    const onReset = () => {
        form.resetFields();
        onCancel();
    };

    const handleOk = async (password: string) => {
        setLoading(true);
        try {
            const loginResult = await login({ email: userEmail!, password });

            if (loginResult) {
                showSuccessNotification();
                form.resetFields();
                onSubmit();
            } else {
                showErrorNotification();
            }
        } catch {
            showErrorNotification();
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        {contextHolder}
        <Modal
            open={visible}
            title="Re-Login"
            okText="Send"
            cancelText="Cancel"
            onCancel={onReset}
            onOk={() => {
                form.validateFields()
                    .then(({ password }) => {
                        handleOk(password);
                    })
                    .catch((info) => {
                        console.log("Validation Failed:", info);
                    });
            }}
            okButtonProps={
               {loading: loading,
                 htmlType: "submit"
               }
            }
        >
            <Form form={form} layout="vertical" name="relogin_form">
                <div className="flex p-2 justify-items-center items-center">
                  <WarningOutlined className="p-2" style={{ fontSize: '30px' }} />
                  <p >
                     Your session will expire in {minutes}m {seconds}s.
                  </p>
                </div>
                <Form.Item className="form-mb-10" label="Please re-enter your password to continue" name="password" rules={[{ required: true, message: "Please enter password" }]}>
                    <Input.Password placeholder="Password" />
                </Form.Item>
            </Form>
        </Modal>
        </>
    );
}
