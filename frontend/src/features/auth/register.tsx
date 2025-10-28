import { Form, Input, Button, Card, Typography, Divider, Progress, message } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import logo from "@/assets/logo.svg";
import type { PasswordStrength } from '@/common/types/app';
import { calculatePasswordStrength } from '@/common/utils/validationUtils';
import type { RegisterFormData } from '@/common/types/userInfo';
import { register } from '@/features/auth/services/authService';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ 
    percent: 0, 
    status: 'normal', 
    color: '#d9d9d9',
    text: ''
  });

  

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const strength = calculatePasswordStrength(e.target.value);
    setPasswordStrength(strength);
  };

  const handleRegister = async (values: RegisterFormData) => {
    setLoading(true);
    try {
      
      const result = await register(values);

      console.log('Registration result:', result);
      if (result) {
        message.success('Account created successfully! Please log in.');
        navigate('/login');
      } else {
        message.error('Registration failed. Please try again.');
      }
    } catch {
      message.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #134b7fff 0%, rgb(37 110 176) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 450,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          borderRadius: '12px',
        }}
      >
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <img 
            src={logo} 
            alt="VigiPastore Logo" 
            width={64} 
            height={64}
            style={{ display: 'block', margin: '0 auto' }}
          />
          <Title level={2} style={{ marginTop: '16px', marginBottom: '8px', color: '#1f2937' }}>
            Create Account
          </Title>
          <Text type="secondary">
            Register with VigiPastore and keep your password private
          </Text>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={handleRegister}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="fullName"
            rules={[
              { required: true, message: 'Please enter your full name' },
              { min: 2, message: 'Name must be at least 2 characters' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Full Name"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Email address"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 8, message: 'Password must be at least 8 characters' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Password"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              style={{ borderRadius: '8px' }}
              onChange={handlePasswordChange} autoComplete='false'
            />
          </Form.Item>

          {passwordStrength.percent > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <Progress
                percent={passwordStrength.percent}
                status={passwordStrength.status}
                strokeColor={passwordStrength.color}
                showInfo={false}
                size="small"
              />
              <div style={{ 
                textAlign: 'right', 
                color: passwordStrength.color, 
                fontSize: '12px',
                marginTop: '4px'
              }}>
                Password Strength: {passwordStrength.text}
              </div>
            </div>
          )}

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Confirm Password"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              style={{ borderRadius: '8px' }} autoComplete='false'
            />
          </Form.Item>

          <div style={{ 
            marginBottom: '16px', 
            padding: '12px', 
            background: '#fffbf0', 
            border: '1px solid #ffd591',
            borderRadius: '8px'
          }}>
            <Text style={{ fontSize: '12px', color: '#d46b08' }}>
              ⚠️ <strong>Important:</strong> Your master password cannot be recovered. 
              Please store it safely as VigiPastore uses zero-knowledge encryption.
            </Text>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #134b7fff 100%)',
                border: 'none',
                fontSize: '16px',
                fontWeight: 500
              }}
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            Already have an account?
          </Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Link to="/login">
            <Button
              type="default"
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '8px',
                borderColor: '#667eea',
                color: '#667eea',
                fontSize: '16px',
                fontWeight: 500
              }}
            >
              Sign In
            </Button>
          </Link>
        </div>

        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          background: '#f8fafc', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <Text style={{ fontSize: '12px', color: '#64748b' }}>
            🔐 End-to-end encrypted • 🛡️ Zero-knowledge architecture
          </Text>
        </div>
      </Card>
    </div>
  );
}