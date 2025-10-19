import { Form, Input, Modal, Progress, Select, type SelectProps } from "antd";
import { useEffect, useState } from "react";
import { calculatePasswordStrength, type DataType } from "../utils/shared";



export default function AddSecret({
    visible,
    onCreate,
    onCancel,
    editRecord = null,
}: {
    visible: boolean;
    onCreate: (values: any) => void;
    onCancel: () => void;
    editRecord?: DataType | null;
}) {
    const [form] = Form.useForm();
    const isEditMode = editRecord !== null;

    const options: SelectProps["options"] = [
        { value: "personal", label: "Personal" },
        { value: "email", label: "Email" },
        { value: "banking", label: "Banking" },
    ];

    const onReset = () => {
        form.resetFields();
        setPasswordStrength(calculatePasswordStrength(''));
        onCancel();
    };

    const [passwordStrength, setPasswordStrength] = useState(calculatePasswordStrength(''));

    const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        const strength = calculatePasswordStrength(newPassword);
        setPasswordStrength(strength);
    };

    // Effect to populate form when editing
    useEffect(() => {
        if (isEditMode && editRecord && visible) {
            form.setFieldsValue({
                name: editRecord.name,
                loginId: editRecord.loginId,
                password: editRecord.password,
                category: editRecord.tags,
                description: editRecord.description,
            });
            // Set password strength for existing password
            setPasswordStrength(calculatePasswordStrength(editRecord.password));
        } else if (!visible) {
            // Reset when modal closes
            form.resetFields();
            setPasswordStrength(calculatePasswordStrength(''));
        }
    }, [editRecord, visible, form, isEditMode]);

    return (
        <Modal
            open={visible}
            title={isEditMode ? "Edit Secret" : "Add New Secret"}
            okText={isEditMode ? "Update" : "Save"}
            cancelText="Cancel"
            onCancel={onReset}
            onOk={() => {
                form
                    .validateFields()
                    .then((values) => {
                        form.resetFields(); // Clear the form fields
                        setPasswordStrength(calculatePasswordStrength(''));
                        if (isEditMode && editRecord) {
                            onCreate({ ...values, id: editRecord.id });
                        } else {
                            onCreate(values);
                        }
                    })
                    .catch((info) => {
                        console.log("Validation Failed:", info);
                    });
            }}
        >
            <Form form={form} layout="vertical" name="add_new_secret_form">
                <Form.Item
                    className="form-mb-10"
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: "Please enter secret name" }]}
                >
                    <Input placeholder="Secret name" />
                </Form.Item>
                <Form.Item
                    className="form-mb-10"
                    label="Login ID"
                    name="loginId"
                    rules={[{ required: true, message: "Please enter login ID" }]}
                >
                    <Input placeholder="Login ID" />
                </Form.Item>
                {!isEditMode && (<Form.Item
                    className="form-mb-10"
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: "Please enter password" }]}
                >
                    <Input.Password placeholder="Password" onChange={onPasswordChange} />
                </Form.Item>)}
                {!isEditMode && passwordStrength.percent > 0 && (
                    <div >
                    <Progress
                        percent={passwordStrength.percent}
                        status={passwordStrength.status}
                        strokeColor={passwordStrength.color}
                        showInfo={false}
                    />
                    <div style={{ textAlign: 'right', color: passwordStrength.color, fontSize: '12px' }}>
                        Password Strength: {passwordStrength.percent >= 75 ? 'Strong' : passwordStrength.percent >= 50 ? 'Medium' : 'Weak'}
                    </div>
                    </div>
                )}
                <Form.Item
                    className="form-mb-10"
                    label="Category"
                    name="category"
                    rules={[{ required: true, message: "Please select a category" }]}
                >
                    <Select
                        mode="tags"
                        options={options}
                        placeholder="Select a category"
                        allowClear
                    />
                </Form.Item>
                <Form.Item className="form-mb-10" label="Notes" name="description">
                    <Input.TextArea rows={3} />
                </Form.Item>
            </Form>
        </Modal>
    );
}
