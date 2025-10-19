import { 
  Card, 
  Tabs, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  Divider, 
  Alert, 
  Modal,
  Progress,
  Space,
  Tooltip,
  Upload,
  message
} from 'antd';
import { 
  UserOutlined, 
  SettingOutlined,
  LockOutlined,
  KeyOutlined,
  ExportOutlined,
  ImportOutlined,
  DeleteOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { useState } from 'react';
import { calculatePasswordStrength, type PasswordStrength } from '../utils/shared';

const { TabPane } = Tabs;


interface MasterPasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface AccountFormData {
  displayName: string;
  email: string;
}

interface GeneralFormData {
  theme: string;
  language: string;
  compactMode: boolean;
}

export default function SettingPage() {
  const [masterPasswordForm] = Form.useForm();
  const [accountForm] = Form.useForm();
  const [generalForm] = Form.useForm();
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ 
    percent: 0, 
    status: 'normal', 
    color: '#d9d9d9' 
  });


  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const strength = calculatePasswordStrength(e.target.value);
    setPasswordStrength(strength);
  };

  const handleMasterPasswordSubmit = (values: MasterPasswordFormData) => {
    console.log('Master password change:', values);
    message.success('Master password updated successfully');
    masterPasswordForm.resetFields();
    setPasswordStrength({ percent: 0, status: 'normal', color: '#d9d9d9' });
  };

  const handleAccountSubmit = (values: AccountFormData) => {
    console.log('Account settings:', values);
    message.success('Account settings updated successfully');
  };

  const handleGeneralSubmit = (values: GeneralFormData) => {
    console.log('General settings:', values);
    message.success('General settings updated successfully');
  };

  const handleExportData = () => {
    Modal.confirm({
      title: 'Export Your Data',
      content: 'This will download an encrypted backup of all your secrets. Keep this file secure.',
      icon: <ExportOutlined />,
      onOk() {
        message.success('Data export started. Download will begin shortly.');
      },
    });
  };

  const handleDeleteAccount = () => {
    Modal.confirm({
      title: 'Delete Account',
      content: 'This action cannot be undone. All your data will be permanently deleted.',
      icon: <DeleteOutlined />,
      okType: 'danger',
      onOk() {
        message.success('Account deletion initiated. You will receive a confirmation email.');
      },
    });
  };

  const enable2FA = () => {
    Modal.info({
      title: 'Enable Two-Factor Authentication',
      content: (
        <div>
          <p>Scan this QR code with your authenticator app:</p>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            {/* Placeholder for QR code */}
            <div style={{ 
              width: 200, 
              height: 200, 
              border: '2px dashed #d9d9d9', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto'
            }}>
              QR Code Here
            </div>
          </div>
          <p>Or enter this key manually: <code>ABCD-EFGH-IJKL-MNOP</code></p>
        </div>
      ),
      onOk() {
        setTwoFactorEnabled(true);
        message.success('Two-factor authentication enabled');
      },
    });
  };

  return (
    <div style={{ margin: '0 auto' }} className="p-5 ">
      <h1 className='text-xl font-bold' style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <SettingOutlined />
        Settings
      </h1>
      
      <Tabs defaultActiveKey="security" size="large">
        {/* Security Settings */}
        <TabPane 
          tab={
            <span className="flex items-center gap-2">
              <SafetyOutlined />
              Security
            </span>
          } 
          key="security"
        >
          <Card title="Master Password" style={{ marginBottom: '16px' }}>
            <Alert
              message="Your master password is the key to all your data. Choose a strong, unique password."
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
            
            <Form
              form={masterPasswordForm}
              layout="vertical"
              onFinish={handleMasterPasswordSubmit}
            >
              <Form.Item
                label="Current Master Password"
                name="currentPassword"
                wrapperCol={{ span: 6 }}
                rules={[{ required: true, message: 'Please enter your current password' }]}
              >
                <Input.Password placeholder="Enter current password" />
              </Form.Item>
              
              <Form.Item
                label="New Master Password"
                name="newPassword"
                wrapperCol={{ span: 6 }}
                rules={[
                  { required: true, message: 'Please enter new password' },
                  { min: 8, message: 'Password must be at least 8 characters' }
                ]}
              >
                <Input.Password 
                  placeholder="Enter new password" 
                  onChange={handlePasswordChange}
                />
              </Form.Item>
              
              {passwordStrength.percent > 0 && (
                <div style={{ marginBottom: '16px' }}>
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
                label="Confirm New Password"
                name="confirmPassword"
                wrapperCol={{ span: 6 }}
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm new password" />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<LockOutlined />}>
                  Update Master Password
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="Two-Factor Authentication" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 500 }}>
                  Two-Factor Authentication {twoFactorEnabled ? '(Enabled)' : '(Disabled)'}
                </p>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button 
                type={twoFactorEnabled ? "default" : "primary"}
                onClick={twoFactorEnabled ? () => setTwoFactorEnabled(false) : enable2FA}
                icon={<KeyOutlined />}
              >
                {twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
              </Button>
            </div>
          </Card>

          <Card title="Session & Security" style={{ marginBottom: '16px' }}>
            <Form 
              layout="vertical" 
              labelCol={{ span: 12 }}
            //   labelAlign="left"
            //   wrapperCol={{ span: 6, offset: 6 }}
              initialValues={{ 
                sessionTimeout: 15,
                autoLock: true,
                biometrics: false 
              }}
            >
              <Form.Item 
                label="Session Timeout" 
                name="sessionTimeout"
                // labelCol={{ span: 12 }}
                wrapperCol={{ span: 6 }}
              >
                <Select>
                  <Select.Option value={5}>5 minutes</Select.Option>
                  <Select.Option value={15}>15 minutes</Select.Option>
                  <Select.Option value={30}>30 minutes</Select.Option>
                  <Select.Option value={60}>1 hour</Select.Option>
                  <Select.Option value={0}>Never</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item 
                label="Auto-lock when idle" 
                name="autoLock" 
                valuePropName="checked"
                // labelCol={{ span: 12 }}
                // wrapperCol={{ span: 6, offset:  10 }}
              >
                <Switch 
                  checked={autoLockEnabled} 
                  onChange={setAutoLockEnabled}
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                />
              </Form.Item>
              
              <Form.Item 
                label="Biometric unlock (when supported)" 
                name="biometrics" 
                valuePropName="checked"
                // labelCol={{ span: 12 }}
                // wrapperCol={{ span: 6, offset: 10 }}
              >
                <Switch 
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                />
              </Form.Item>
            </Form>
          </Card>

          <Card title="Encryption & Backup">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>Encryption Standard</p>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    AES-256 encryption with zero-knowledge architecture
                  </p>
                </div>
                <Tooltip title="Your data is encrypted with military-grade AES-256 encryption">
                  <InfoCircleOutlined style={{ color: '#52c41a' }} />
                </Tooltip>
              </div>
              
              <Divider />
              
              <Space>
                <Button icon={<ExportOutlined />} onClick={handleExportData}>
                  Export Encrypted Backup
                </Button>
                <Upload
                  accept=".json,.enc"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={() => {
                    message.success('Backup file uploaded for restoration');
                  }}
                >
                  <Button icon={<ImportOutlined />}>
                    Import Backup
                  </Button>
                </Upload>
              </Space>
            </Space>
          </Card>
        </TabPane>

        {/* Account Settings */}
        <TabPane 
          tab={
            <span className="flex items-center gap-2">
              <UserOutlined />
              Account
            </span>
          } 
          key="account"
        >
          <Card title="Profile Information" style={{ marginBottom: '16px' }}>
            <Form
              form={accountForm}
              layout="vertical"
              onFinish={handleAccountSubmit}
              initialValues={{
                email: 'user@example.com',
                displayName: 'John Doe'
              }}
            >
              <Form.Item
                label="Display Name"
                name="displayName"
                wrapperCol={{ span: 6 }}
                rules={[{ required: true, message: 'Please enter your display name' }]}
              >
                <Input placeholder="Your display name" />
              </Form.Item>
              
              <Form.Item
                label="Email Address"
                name="email"
                wrapperCol={{ span: 6 }}
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="your.email@example.com" />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update Profile
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="Account Actions" style={{ marginBottom: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>Export All Data</p>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    Download all your secrets in encrypted format
                  </p>
                </div>
                <Button icon={<DownloadOutlined />} onClick={handleExportData}>
                  Export Data
                </Button>
              </div>
              
              <Divider />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 500, color: '#ff4d4f' }}>Delete Account</p>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button danger icon={<DeleteOutlined />} onClick={handleDeleteAccount}>
                  Delete Account
                </Button>
              </div>
            </Space>
          </Card>
        </TabPane>

        {/* General Settings */}
        <TabPane 
          tab={
            <span className="flex items-center gap-2">
              <SettingOutlined />
              General
            </span>
          } 
          key="general"
        >
          <Card title="Appearance" style={{ marginBottom: '16px' }}>
            <Form
              form={generalForm}
              layout="vertical"
              onFinish={handleGeneralSubmit}
              initialValues={{
                theme: 'light',
                language: 'en',
                compactMode: false
              }}
            >
              <Form.Item label="Theme" name="theme" wrapperCol={{ span: 6 }}>
                <Select>
                  <Select.Option value="light">Light</Select.Option>
                  <Select.Option value="dark">Dark</Select.Option>
                  <Select.Option value="auto">Auto (System)</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="Language" name="language" wrapperCol={{ span: 6 }}>
                <Select>
                  <Select.Option value="en">English</Select.Option>
                  <Select.Option value="es">Español</Select.Option>
                  <Select.Option value="fr">Français</Select.Option>
                  <Select.Option value="de">Deutsch</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="Compact Mode" name="compactMode" valuePropName="checked">
                <Switch 
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                />
              </Form.Item>
            </Form>
          </Card>

          <Card title="Notifications" style={{ marginBottom: '16px' }}>
            <Form layout="vertical" initialValues={{
              securityAlerts: true,
              loginNotifications: true,
              updateNotifications: false
            }}>
              <Form.Item label="Security Alerts" name="securityAlerts" valuePropName="checked">
                <Switch 
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                />
              </Form.Item>
              
              <Form.Item label="Login Notifications" name="loginNotifications" valuePropName="checked">
                <Switch 
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                />
              </Form.Item>
              
              <Form.Item label="Update Notifications" name="updateNotifications" valuePropName="checked">
                <Switch 
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                />
              </Form.Item>
            </Form>
          </Card>

          <Card title="Advanced">
            <Form layout="vertical" initialValues={{
              offlineMode: false,
              syncFrequency: 'auto',
              clearClipboard: 30
            }}>
              <Form.Item label="Offline Mode" name="offlineMode" valuePropName="checked">
                <Switch 
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                />
              </Form.Item>
              
              <Form.Item label="Sync Frequency" name="syncFrequency" wrapperCol={{ span: 6 }}>
                <Select>
                  <Select.Option value="auto">Automatic</Select.Option>
                  <Select.Option value="manual">Manual only</Select.Option>
                  <Select.Option value="5min">Every 5 minutes</Select.Option>
                  <Select.Option value="1hour">Every hour</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item label="Clear Clipboard After" name="clearClipboard" wrapperCol={{ span: 6 }}>
                <Select>
                  <Select.Option value={10}>10 seconds</Select.Option>
                  <Select.Option value={30}>30 seconds</Select.Option>
                  <Select.Option value={60}>1 minute</Select.Option>
                  <Select.Option value={0}>Never</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Save General Settings
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
}
