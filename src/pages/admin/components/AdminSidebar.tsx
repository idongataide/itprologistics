import React from 'react';
import { Layout, Menu, Avatar, Typography, Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  CarOutlined,
  PlusOutlined,
  CarFilled,
  LogoutOutlined,
} from '@ant-design/icons';
import { useOnboardingStore } from '@/global/store';

const { Sider } = Layout;
const { Text } = Typography;

interface AdminSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  collapsed, 
  onCollapse,
  toggleCollapsed 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Users',
    },
    {
      key: '/admin/drivers',
      icon: <CarOutlined />,
      label: 'Drivers',
    },
    {
      key: '/admin/vehicles',
      icon: <CarOutlined />,
      label: 'Vehicles',
    },
    {
      key: '/admin/orders/create',
      icon: <PlusOutlined />,
      label: 'Create Orders',
    },
    {
      key: '/admin/rides',
      icon: <CarFilled />,
      label: 'Rides',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    useOnboardingStore.persist.clearStorage(); 
    localStorage.clear(); 
    sessionStorage.clear(); 
    useOnboardingStore.setState({ 
      token: null, 
      isAuthorized: false, 
      firstName: "", 
      lastName: "",
      role: "",
      email: "",
      userName: ""
    });
    navigate("/login");
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={260}
      style={{
        background: '#ffffff',
        borderRight: '1px solid #f0f0f0',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        paddingTop:'90px'
        // zIndex: 1000,
      }}
    >
      <div
        style={{
          padding: collapsed ? '16px 8px' : '24px 16px',
          textAlign: 'center',
          borderBottom: '1px solid #f0f0f0',
          position: 'relative',
        }}
      >
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleCollapsed}
          style={{
            fontSize: '16px',
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
          }}
        />
        
        <Avatar
          size={collapsed ? 32 : 48}
          style={{
            backgroundColor: '#FF6C2D',
            marginBottom: collapsed ? 0 : 8,
          }}
        >
          A
        </Avatar>

        {!collapsed && (
          <div>
            <Text strong style={{ display: 'block', fontSize: '16px' }}>
              Admin Panel
            </Text>            
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            background: 'transparent',
            marginTop: 16,
          }}
        />
      </div>

      <div
        style={{
          padding: '16px',
          borderTop: '1px solid #f0f0f0',
          background: '#ffffff',
        }}
      >
        <Menu
          mode="inline"
          selectable={false}
          items={[
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: collapsed ? '' : 'Logout',
              danger: true,
              onClick: handleLogout,
            },
          ]}
          style={{
            border: 'none',
            background: 'transparent',
          }}
        />
      </div>
    </Sider>
  );
};

export default AdminSidebar;