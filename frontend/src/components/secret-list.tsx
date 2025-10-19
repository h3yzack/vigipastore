import { Button, Modal, Space, Table, Tag } from 'antd';
import type { TableProps } from 'antd';
import { useState } from 'react';

import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { DataType } from '../utils/shared';
import PasswordViewer from './password-viewer';

interface SecretListProps {
    data: DataType[];
    onEdit: (record: DataType) => void;
    onDelete: (record: DataType) => void;
}

export default function SecretList({ data, onEdit, onDelete }: SecretListProps) {
    const [passwordViewerVisible, setPasswordViewerVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<DataType | null>(null);

    const handleDeleteConfirm = (record: DataType) => {
        Modal.confirm({
            title: 'Delete Secret',
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to delete "${record.name}"? This action cannot be undone.`,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk() {
                onDelete(record);
            },
        });
    };

    const handleViewPassword = (record: DataType) => {
        setSelectedRecord(record);
        setPasswordViewerVisible(true);
    };

    const handleClosePasswordViewer = () => {
        setPasswordViewerVisible(false);
        setSelectedRecord(null);
    };

    const columns: TableProps<DataType>['columns'] = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <a>{text}</a>,
        },
        {
            title: 'Login ID',
            dataIndex: 'loginId',
            key: 'loginId',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Password',
            key: 'password',
            render: (_, record) => (
                <Space size={'small'} >
                    {'•'.repeat(record.password.length)}
                    <Button 
                        shape="circle" 
                        size="small" 
                        icon={<EyeOutlined />} 
                        onClick={() => handleViewPassword(record)}
                    />
                </Space>
            ),
        },
        {
            title: 'Tags',
            key: 'tags',
            dataIndex: 'tags',
            render: (_, { tags }) => (
                <>
                    {tags.map((tag) => {
                        let color = tag.length > 5 ? 'geekblue' : 'green';
                        if (tag === 'loser') {
                            color = 'volcano';
                        }
                        return (
                            <Tag color={color} key={tag}>
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
            <Table<DataType> columns={columns} dataSource={data} />
            
            <PasswordViewer
                visible={passwordViewerVisible}
                onClose={handleClosePasswordViewer}
                secretName={selectedRecord?.name || ''}
                password={selectedRecord?.password || ''}
            />
        </div>
    );
}


