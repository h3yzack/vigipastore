import { Form, Input, Button, Card, Typography, Divider, message } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.svg';

const { Title, Text } = Typography;

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: LoginFormData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock token
      const token = 'mock-token-' + Date.now();
      
      // Use auth context to login
      login(values.email, token);
      
      message.success('Login successful!');
      navigate('/');
    } catch {
      message.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #134b7fff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
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
            Welcome Back
          </Title>
          <Text type="secondary">
            Sign in to your VigiPastore account
          </Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Email address"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Password"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          {/* <Form.Item style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link 
                to="/forgot-password" 
                style={{ color: '#667eea', textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </div>
          </Form.Item> */}

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
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            New to VigiPastore?
          </Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Link to="/register">
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
              Create Account
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
            🔐 Your data is protected with end-to-end encryption
          </Text>
        </div>
      </Card>
    </div>
  );
}