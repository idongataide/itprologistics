import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Spin,
  message,
} from 'antd';
import {
  UserOutlined,
  CarOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AdminRides from '../rides/AdminRides';
import { getAllRides, Ride as RideType, Driver as DriverType } from '../../../../services/admin/adminRideService';
import driverService from '../../../../services/admin/driverService';
import userService, { User } from '../../../../services/admin/userService';

const { Title, Text } = Typography;

interface AdminStat {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  prefix?: string;
  suffix?: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [allRides, setAllRides] = useState<RideType[]>([]);
  const [drivers, setDrivers] = useState<DriverType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch rides
        const ridesResponse = await getAllRides();
        if (ridesResponse.success && ridesResponse.rides) {
          setAllRides(ridesResponse.rides);
        } else {
          message.error('Failed to fetch rides');
        }

        // Fetch drivers
        const driversResponse = await driverService.getDrivers();
        if (driversResponse.success && driversResponse.drivers) {
          console.log('Fetched drivers:', driversResponse);
          setDrivers(driversResponse?.stats?.activeDrivers || []);
        } else {
          message.error('Failed to fetch drivers');
        }

        // Fetch users
        const usersResponse = await userService.getUsers();
        if (usersResponse.success && usersResponse.users) {
          setUsers(usersResponse.users);
        } else {
          message.error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const adminStats: AdminStat[] = [    
    {
      title: 'Total Users',
      value: users.length,
      icon: <UserOutlined />,
      color: '#1890FF',
      suffix: ' users',
    },
    {
      title: 'Active Drivers',
      value: drivers,
      icon: <CarOutlined />,
      color: '#52C41A',
      suffix: ' drivers',
    },
    {
      title: 'Total Rides',
      value: allRides.length,
      icon: <CarOutlined />,
      color: '#FF6C2D',
      suffix: ' rides',
    },
    {
      title: 'Pending Rides',
      value: allRides.filter(r => r.status === 'pending').length,
      icon: <ClockCircleOutlined />,
      color: '#1890FF',
      suffix: ' pending',
    },
    {
      title: 'Completed Rides',
      value: allRides.filter(r => r.status === 'completed').length,
      icon: <CarOutlined />,
      color: '#1890FF',
      suffix: ' completed',
    },
    {
      title: 'Cancelled Rides',
      value: allRides.filter(r => r.status === 'cancelled').length,
      icon: <CarOutlined />,
      color: '#FF4D4F',
      suffix: ' cancelled',
    },
    {
      title: 'Total Earnings',
      value: allRides
        .filter(r => r.status === 'completed')
        .reduce((sum, ride) => sum + ride.totalFare, 0)
        .toFixed(2),
      icon: <DollarOutlined />,
      color: '#FFD700',
      prefix: 'N',
    },
  ];

 
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 flex items-center justify-center">
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="order-2 sm:order-1">
              <h3 className="text-gray-800 text-xl sm:text-2xl font-bold">Welcome Back, Admin! 👋</h3>
              <p className="text-gray-600 text-sm sm:text-base">Manage all rides, drivers, and orders</p>
            </div>
            
            <div className="order-1 sm:order-2 w-full sm:w-auto">
              <Button
                type="primary"
                size="large"
                className="bg-gradient-to-r from-orange-500 to-red-500 border-0 hover:from-orange-600 hover:to-red-600 h-12 px-4 sm:px-6 shadow-lg w-full sm:w-auto"
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/orders/create')}
                block
              >
                <span className="hidden sm:inline">Create New Order</span>
                <span className="sm:hidden">New Order</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <Row gutter={[24, 24]} className="mb-8">
          {adminStats.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card className="border-0 shadow-sm rounded-2xl hover:shadow-xl transition-all duration-300 h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="text-gray-600 text-sm font-medium">{stat.title}</Text>
                    <div className="mt-2">
                      <Text className="text-2xl font-bold" style={{ color: stat.color }}>
                        {stat.prefix}{stat.value}{stat.suffix}
                      </Text>
                    </div>
                  </div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}40)`,
                      border: `1px solid ${stat.color}30`,
                    }}
                  >
                    <div style={{ color: stat.color, fontSize: '20px' }}>{stat.icon}</div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Rides Section */}
        <div className="mt-8">
          <AdminRides />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
