import type { PasswordStrength } from "@/common/types/app";
import { calculatePasswordStrength } from "@/common/utils/validationUtils";
import { Alert, Button, Card, Form, Input, Progress } from "antd";
import { useState } from "react";

import { LockOutlined } from "@ant-design/icons";
import type { MasterPasswordFormData } from "@/common/types/userInfo";
import { useSettingService } from "@/features/setting/hook/useSettingService";

export default function MasterPassword() {
    const [masterPasswordForm] = Form.useForm();
    const { resetMasterPassword } = useSettingService();
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
        percent: 0,
        status: "normal",
        color: "#d9d9d9",
        text: "",
    });

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const strength = calculatePasswordStrength(e.target.value);
        setPasswordStrength(strength);
    };

    const handleMasterPasswordSubmit = async (values: MasterPasswordFormData) => {
        try {
            setLoading(true);
            await resetMasterPassword(values);
            masterPasswordForm.resetFields();
            setPasswordStrength({ percent: 0, status: "normal", color: "#d9d9d9", text: "" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Master Password" style={{ marginBottom: "16px" }}>
            <Alert
                message="Your master password is the key to all your data. Choose a strong, unique password."
                type="info"
                showIcon
                style={{ marginBottom: "16px" }}
            />

            <div className="flex">
                <div className="min-w-[50%] md:min-w-100 p-5">
                    <Form form={masterPasswordForm} layout="vertical" onFinish={handleMasterPasswordSubmit}>
                        <Form.Item
                            label="Current Master Password"
                            name="currentPassword"
                            // wrapperCol={{ span: 6 }}
                            rules={[{ required: true, message: "Please enter your current password" }]}
                        >
                            <Input.Password placeholder="Enter current password" />
                        </Form.Item>

                        <Form.Item
                            label="New Master Password"
                            name="newPassword"
                            // wrapperCol={{ span: 8 }}
                            rules={[
                                { required: true, message: "Please enter new password" },
                                { min: 8, message: "Password must be at least 8 characters" },
                            ]}
                        >
                            <Input.Password placeholder="Enter new password" onChange={handlePasswordChange} />
                        </Form.Item>

                        {passwordStrength.percent > 0 && (
                            <div style={{ marginBottom: "16px" }}>
                                <Progress
                                    percent={passwordStrength.percent}
                                    status={passwordStrength.status}
                                    strokeColor={passwordStrength.color}
                                    showInfo={false}
                                />
                                <div style={{ textAlign: "right", color: passwordStrength.color, fontSize: "12px" }}>
                                    Password Strength:{" "}
                                    {passwordStrength.percent >= 75 ? "Strong" : passwordStrength.percent >= 50 ? "Medium" : "Weak"}
                                </div>
                            </div>
                        )}

                        <Form.Item
                            label="Confirm New Password"
                            name="confirmPassword"
                            // wrapperCol={{ span: 6 }}
                            dependencies={["newPassword"]}
                            rules={[
                                { required: true, message: "Please confirm your password" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("newPassword") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("Passwords do not match"));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder="Confirm new password" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" icon={<LockOutlined />} loading={loading}>
                                Update Master Password
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </Card>
    );
}
