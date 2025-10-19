
import {
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Button, Layout, theme, Modal, message } from "antd";
import logo from "./assets/logo.svg";

import "./App.css";
import { Link, Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "./contexts/AuthContext";

const { Header, Content, Footer } = Layout;


function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    Modal.confirm({
      title: 'Logout',
      content: 'Are you sure you want to logout?',
      onOk() {
        logout();
        message.success('Logged out successfully');
        navigate('/login');
      },
    });
  };

  // Generate breadcrumb items based on current route
  const generateBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment !== '');
    
    if (pathSegments.length === 0) {
      // Root path "/"
      return [{ title: 'Home' }];
    }

    const items: Array<{ title: string | React.ReactNode }> = [];
    let currentPath = '';

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Convert segment to title case
      const title = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      if (index === pathSegments.length - 1) {
        // Last segment - not clickable
        items.push({ title });
      } else {
        // Intermediate segments - clickable
        items.push({ 
          title: <Link to={currentPath}>{title}</Link>
        });
      }
    });

    return items;
  };

  return (
    <div className="flex flex-col justify-between min-h-screen">
      <Layout className="grow-0 shadow-lg">
        <Header 
          className="flex items-center justify-between px-6"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #134b7fff 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Link to="/">
            <div className="logo flex items-center gap-3 w-64 shrink-0">
              <img src={logo} alt="Logo" width={50} />
              <span className="tracking-wide font-sans text-white font-bold text-2xl drop-shadow-sm">
                VigiPastore
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button 
              shape="circle" 
              icon={<SettingOutlined />} 
              onClick={() => navigate("/setting")}
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white'
              }}
              className="hover:bg-white/20 transition-all duration-200"
            />
            <Button 
              shape="circle" 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white'
              }}
              className="hover:bg-white/20 transition-all duration-200"
            />
          </div>
        </Header>
      </Layout>
      <div
        style={{ 
          padding: "0 48px 24px",
          background: '#f8fafc',
          minHeight: 'calc(100vh - 115px)'
        }}
        className="flex-grow"
      >
        <Breadcrumb
          style={{ 
            margin: "10px 0",
            padding: "8px 0"
          }}
          items={generateBreadcrumbItems()}
        />
        <Layout
          style={{
            padding: "24px",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(226, 232, 240, 0.8)'
          }}
        >
          <Content style={{ minHeight: 280 }}>
            <Outlet />
          </Content>
        </Layout>
      </div>
      <Footer 
        style={{ 
          textAlign: "center",
          background: '#f1f5f9',
          color: '#64748b',
          borderTop: '1px solid #e2e8f0',
          padding: '16px 24px'
        }}
      >
        ©{new Date().getFullYear()} Created by @H3yzack
      </Footer>
    </div>
  );
}

export default App;
