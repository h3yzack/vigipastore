import { Form, Input, Modal, Progress, Select, type SelectProps } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { calculatePasswordStrength } from "@/common/utils/validationUtils";
import type { VaultData } from "@/common/types/vault";
import { useVaultService } from "../hook/useVaultService";

export default function AddSecret({
    visible,
    onCreate,
    onCancel,
    editRecordId = null,
}: {
    visible: boolean;
    onCreate: (status: boolean) => void;
    onCancel: () => void;
    editRecordId?: string | null;
}) {
    const [form] = Form.useForm();
    const isEditMode = editRecordId !== null;
    const [tags, setTags] = useState<string[]>([]);
    const [editRecord, setEditRecord] = useState<VaultData | null>(null);
    const vaultService = useVaultService();
    const populatedRef = useRef(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formState, setFormState] = useState({
        selectedItems: [] as string[],
        passwordStrength: calculatePasswordStrength(''),
    });

    const options: SelectProps["options"] = tags.map((tag) => ({ label: tag, value: tag }));

    const filteredOptions = options.filter(option => 
        !formState.selectedItems.some(selected => 
            selected.toLowerCase() === (option.value as string).toLowerCase()
        )
    );

    const fetchData = useCallback(async () => {
        if (visible) {
            const tagData = await vaultService.getUserTags();
            setTags(tagData);
        }
    }, [vaultService, visible]);

    const onReset = useCallback(() => {
        form.resetFields();
        setFormState({
            selectedItems: [],
            passwordStrength: calculatePasswordStrength(''),
        });
        setEditRecord(null);
        onCancel();
    }, [form, setFormState, setEditRecord, onCancel]);

    const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        const strength = calculatePasswordStrength(newPassword);
        setFormState(prev => ({ ...prev, passwordStrength: strength }));
    };

    const getVaultRecord = useCallback(async () => {
        if (populatedRef.current) return;

        try {
            setLoading(true);
            const toEditRecord = await vaultService.getVaultRecordById(editRecordId!);

            if (!toEditRecord) {
                onReset();
                return;
            }
            setEditRecord(toEditRecord);

            setTimeout(() => {
                form.setFieldsValue({
                    title: toEditRecord.title,
                    loginId: toEditRecord.loginId,
                    password: toEditRecord.password,
                    tags: toEditRecord.tags,
                    notes: toEditRecord.notes,
                });
                setFormState(prev => ({
                    ...prev,
                    selectedItems: toEditRecord.tags || [],
                    passwordStrength: calculatePasswordStrength(toEditRecord.password!),
                }));
            }, 0);

            populatedRef.current = true;
        } catch (error) {
            console.error("Error fetching or decrypting record: ", error);
            onReset();
        } finally {
            setLoading(false);
        }
    }, [form, setFormState, onReset, editRecordId, vaultService, setEditRecord]);

    const handleAddOrUpdateVault = async (values: VaultData) => {
        try{
            setSubmitLoading(true);
            const status = await vaultService.saveOrUpdateVault(values);
            if (status) {
                onReset();
                onCreate(true);
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Effect to populate form when editing
    useEffect(() => {
        if (visible && isEditMode && !populatedRef.current) {
            getVaultRecord();
        } else if (!visible) {
            populatedRef.current = false; // Reset on close
        }
    }, [visible, isEditMode, getVaultRecord]);

    return (
        <>
        <Modal
            open={visible}
            title={isEditMode ? "Update Vault Record" : "Add New Vault Record"}
            okText={isEditMode ? "Update" : "Save"}
            cancelText="Cancel"
            maskClosable={false}
            onCancel={onReset}
            confirmLoading={submitLoading}
            loading={loading}
            onOk={() => {
                form
                    .validateFields()
                    .then((values) => {
                        values.tags = values.tags.map((tag: string) => tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase());
                        handleAddOrUpdateVault({ ...values, id: isEditMode && editRecord ? editRecord.id : null });
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
                    name="title"
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
                <Form.Item
                    className="form-mb-10"
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: "Please enter password" }]}
                >
                    <Input.Password placeholder="Password" onChange={onPasswordChange} />
                </Form.Item>
                {formState.passwordStrength.percent > 0 && (
                    <div >
                    <Progress
                        percent={formState.passwordStrength.percent}
                        status={formState.passwordStrength.status}
                        strokeColor={formState.passwordStrength.color}
                        showInfo={false}
                    />
                    <div style={{ textAlign: 'right', color: formState.passwordStrength.color, fontSize: '10px' }}>
                        Password Strength: {formState.passwordStrength.percent >= 75 ? 'Strong' : formState.passwordStrength.percent >= 50 ? 'Medium' : 'Weak'}
                    </div>
                    </div>
                )}
                <Form.Item
                    className="form-mb-10"
                    label="Category"
                    name="tags"
                    rules={[{ required: true, message: "Please select a category" }]}
                >
                    <Select
                        mode="tags"
                        options={filteredOptions}
                        value={formState.selectedItems}  // Bind to state
                        onChange={(selected) => setFormState(prev => ({ ...prev, selectedItems: selected }))}  // Update state
                        placeholder="Select a category"
                        allowClear
                        filterSort={(optionA, optionB) =>
                            (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                        }
                    />
                </Form.Item>
                <Form.Item className="form-mb-10" label="Notes" name="notes">
                    <Input.TextArea rows={3} />
                </Form.Item>
            </Form>
        </Modal>
        </>
    );
}
