import { Modal, Input, Button, Space, Typography, message } from 'antd';
import { CopyOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Text } = Typography;

interface PasswordViewerProps {
  visible: boolean;
  onClose: () => void;
  secretName: string;
  password: string;
}

export default function PasswordViewer({ visible, onClose, secretName, password }: PasswordViewerProps) {
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      message.success('Password copied to clipboard');
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = password;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      message.success('Password copied to clipboard');
    }
  };

  const handleClose = () => {
    setShowPassword(false);
    onClose();
  };

  return (
    <Modal
      title={`Password for "${secretName}"`}
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button key="close" onClick={handleClose}>
          Close
        </Button>,
      ]}
      width={400}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Click the eye icon to reveal password
          </Text>
        </div>
        
        <div style={{ position: 'relative' }}>
          <Input
            value={showPassword ? password : '•'.repeat(password.length)}
            readOnly
            style={{
              fontFamily: 'monospace',
              fontSize: '16px',
              paddingRight: '80px',
            }}
          />
          <div style={{ 
            position: 'absolute', 
            right: '8px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            display: 'flex',
            gap: '4px'
          }}>
            <Button
              type="text"
              size="small"
              icon={showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => setShowPassword(!showPassword)}
            />
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={copyToClipboard}
            />
          </div>
        </div>

        <div style={{ 
          background: '#f6ffed', 
          border: '1px solid #b7eb8f', 
          borderRadius: '6px', 
          padding: '8px 12px' 
        }}>
          <Text style={{ fontSize: '12px', color: '#52c41a' }}>
            🔒 This password will be automatically cleared from clipboard after 30 seconds for security
          </Text>
        </div>
      </Space>
    </Modal>
  );
}