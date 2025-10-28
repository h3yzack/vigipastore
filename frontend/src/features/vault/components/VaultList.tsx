import { Avatar, Button, Modal, Space, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';

import {
    DeleteOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { VaultData } from '@/common/types/vault';
import { Link } from 'react-router';
import { getInitials } from '@/common/utils/appUtils';
import { avatarColors, tagColors } from '@/common/types/app';

interface SecretListProps {
    data: VaultData[];
    onEdit: (record: VaultData) => void;
    onDelete: (record: VaultData) => void;
    loading: boolean;
    onSelect: (record: VaultData | null) => void;
}

const SecretList = forwardRef(function SecretList({ data, onEdit, onDelete, loading, onSelect }: SecretListProps, ref) {

    const [selectedRecord, setSelectedRecord] = useState<VaultData | null>(null);

    const handleDeleteConfirm = (record: VaultData) => {
        Modal.confirm({
            title: 'Delete Secret',
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to delete "${record.title}"? This action cannot be undone.`,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk() {
                onDelete(record);
            },
        });
    };

    useImperativeHandle(ref, () => ({
        triggerUnselect() {
            setSelectedRecord(null);
        },
    }));

    const onRow = useCallback((record: VaultData) => ({
        className: selectedRecord?.id === record.id ? 'bg-blue-100' : '',
    }), [selectedRecord]);

    const handleViewDetails = (record: VaultData | null) => {
        setSelectedRecord(record);
        // setPasswordViewerVisible(true);
        onSelect(record);
    };

    const columns: TableProps<VaultData>['columns'] = [
        {
            title: 'Name',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) =>{
                const index = record!.id!.charCodeAt(0) % avatarColors.length;
                return (
                    <>  
                        <Avatar style={{ backgroundColor: avatarColors[index], verticalAlign: 'middle' }} size="large" gap={2}>
                            {getInitials(text)}
                        </Avatar>
                        <Link className="ps-2"  to={"#"} onClick={() => handleViewDetails(record)}>{text.toUpperCase()}</Link>
                    </>
                )},
        },
        {
            title: 'Login ID',
            dataIndex: 'loginId',
            key: 'loginId',
            width: 200,
        },
        {
            title: 'Tags',
            key: 'tags',
            dataIndex: 'tags',
            render: (_, { tags }) => (
                <>
                    {tags && tags.map((tag) => {
                        const index = tag.charCodeAt(0) % tagColors.length;
                        return (
                            <Tag color={tagColors[index]} key={tag}>
                                {tag.toUpperCase()}
                            </Tag>
                        );
                    })}
                </>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            width: 150,
            className: 'text-center',
            render: (_, record) => (
                <Space size={'small'} >
                    <Button 
                        shape="circle" 
                        size="small" 
                        icon={<EditOutlined />} 
                        onClick={() => onEdit(record)}
                    />
                    <Button 
                        shape="circle" 
                        size="small" 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDeleteConfirm(record)}
                        danger
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Table<VaultData> columns={columns} 
            onRow={onRow}
            rowKey="id"
            dataSource={data} loading={loading} />
        </div>
    );
});

export default SecretList;
