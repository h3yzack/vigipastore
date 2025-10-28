import { Button, Input, Select, type InputRef } from "antd";

import { FileProtectOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import SecretList from "./components/VaultList";
import AddSecret from "@/features/vault/components/VaultForm";
import { useCallback, useEffect, useRef, useState } from "react";
import type { VaultData } from "@/common/types/vault";
import { useVaultService } from "@/features/vault/hook/useVaultService";
import VaultDetails from "./components/VaultDetails";

interface VaultDetailsRef {
    triggerReload: () => void;
}

interface VaultListRef {
    triggerUnselect: () => void;
}

export default function HomePage() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingRecordId, setEditingRecordId] = useState<string | null | undefined>(null);
    const vaultService = useVaultService();

    const [data, setData] = useState<VaultData[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
    const vaultDetailsRef = useRef<VaultDetailsRef>(null);
    const vaultListRef = useRef<VaultListRef>(null);
    const filteredTag = useRef<string | null>(null);
    const searchQueryRef = useRef<InputRef>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const tagData = await vaultService.getUserTags();
            setTags(tagData);
            let vaults = [];

            if (searchQueryRef.current?.input?.value || filteredTag.current) {
                vaults = await vaultService.searchVaultRecords(searchQueryRef.current?.input?.value, filteredTag.current);
            } else {
                vaults = await vaultService.getUserVaults();
            }

            setData(vaults || []);
        } finally {
            setLoading(false);
        }
    },[setTags, setData, vaultService]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const showAddEditModal = (record: VaultData | null) => {
        setEditingRecordId(record ? record.id : null);
        setIsModalVisible(true);
    }

    const handleDelete = async (record: VaultData) => {
        setLoading(true);
        const status = await vaultService.deleteUserVault(record.id!);
        if (status) {
            fetchData();
            if (vaultDetailsRef.current && selectedRecordId === record.id) {
                setSelectedRecordId(null); 
            } else if (vaultDetailsRef.current && selectedRecordId) {
                vaultDetailsRef.current.triggerReload();
            }
        } 
        setLoading(false);
    };

    const onChange = (value: string) => {
        filteredTag.current = value || null;
        fetchData();
    };

    // const handleSearch = () => {
    //     fetchData();
    // };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setEditingRecordId(null);
    };

    const handleAddOrUpdateVault = async (status: boolean) => {
        if (status) {
            await fetchData();
            if (vaultDetailsRef.current && selectedRecordId) {
                vaultDetailsRef.current.triggerReload();
            }
            handleModalClose();
        }
    };

    const handleCloseDetailsPanel = () => {
        setSelectedRecordId(null);
        if (vaultListRef.current) {
            vaultListRef.current.triggerUnselect();
        }
    };

    const handleSelectRecord = (record: VaultData | null) => {  // New handler for selecting a record
        setSelectedRecordId(record ? record.id! : null);
    };

    const isRightPanelVisible = selectedRecordId !== null;  // Determine visibility based on selection


    return (
        <>  
            <div style={{minHeight: 'calc(100vh - 285px)'}} className="w-full mb-5 flex justify-between justify-items-start gap-4 relative overflow-x-hidden">
                <div className={isRightPanelVisible ? "w-[70%]" : "w-full" } >
                    <div style={{ margin: "0 auto" }} className="p-5 flex flex-col gap-5 w-full">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-bold">
                                <span className="flex items-center gap-2">
                                    <FileProtectOutlined />
                                    Vault Records
                                </span>
                            </h1>
                            <div className="ml-4 flex items-center gap-2">
                                <Select
                                    size="large"
                                    className="min-w-[180px]"
                                    showSearch
                                    placeholder="Filter by tag"
                                    optionFilterProp="label"
                                    onChange={onChange}
                                    // onSearch={onSearch}
                                    key={"tag"}
                                    allowClear
                                    options={tags.map((tag) => ({ label: tag, value: tag }))}
                                    filterSort={(optionA, optionB) =>
                                    (optionA?.label ?? '').toString().toLowerCase().localeCompare((optionB?.label ?? '').toString().toLowerCase())
                                    }
                                />
                                <Input
                                    placeholder="Quick Search..."
                                    key={"search"}
                                    ref={searchQueryRef}
                                    allowClear
                                    onClear={() => fetchData()}
                                    prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
                                    style={{
                                        maxWidth: 520,
                                        width: "100%",
                                        borderRadius: 9999,
                                    }}
                                    size="large"
                                    onPressEnter={() => fetchData()}
                                />
                                <Button size="large" type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => showAddEditModal(null)}></Button>
                                <Button size="large" type="default" variant="filled" shape="circle" icon={<ReloadOutlined />} onClick={() => fetchData()}></Button>
                            </div>
                        </div>
                        <div className="">
                            <SecretList data={data} onEdit={showAddEditModal} onDelete={handleDelete} loading={loading} 
                                onSelect={handleSelectRecord} ref={vaultListRef}
                            />
                        </div>

                        <AddSecret visible={isModalVisible} onCreate={handleAddOrUpdateVault} onCancel={handleModalClose} editRecordId={editingRecordId} />
                    </div>
                </div>
                <div className={`
                    absolute top-0 right-0 h-full
                    w-[30%] ml-5 self-stretch
                    transition-transform duration-300
                    ${isRightPanelVisible ? 'translate-x-0' : 'translate-x-full'}
                `}>
                    <VaultDetails recordId={selectedRecordId!} ref={vaultDetailsRef} onClose={handleCloseDetailsPanel} />
                </div>
            </div>
            
        </>
    );
}
