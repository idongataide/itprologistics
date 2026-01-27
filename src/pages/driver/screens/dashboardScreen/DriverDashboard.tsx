import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Table, Tag, Space, Modal, message, Spin } from 'antd';
import {
  CarOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  WarningOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStore } from '@/global/store';
import { getDriverRides, acceptRide, declineRide, Ride as RideType } from '../../../../services/rideService';


const { Text } = Typography;

interface DriverStat {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  prefix?: string;
  suffix?: string;
}

type RideStatus = 'completed' | 'awaiting_driver_confirmation' | 'in_progress' | 'picked_up' | 'accepted' | 'pending' | 'cancelled' | 'searching' | 'arrived';

interface Ride {
  id: string;
  date: string;
  pickup: string;
  destination: string;
  status: RideStatus;
  fare: number;
  rider: string; // Driver will see rider's name
}

const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isDeclineModalVisible, setIsDeclineModalVisible] = useState(false);
  const [rideToDecline, setRideToDecline] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { userName } = useOnboardingStore();
  const [driverRides, setDriverRides] = useState<RideType[]>([]);

  // Fetch driver rides from backend
  useEffect(() => {
    const fetchDriverRides = async () => {
      try {
        setLoading(true);
        const response = await getDriverRides();
        if (response.success && response.rides) {
          setDriverRides(response.rides);
        } else {
          message.error('Failed to fetch rides');
        }
      } catch (error) {
        console.error('Error fetching driver rides:', error);
        message.error('Error loading rides');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverRides();
  }, []);

  const driverStats: DriverStat[] = [
    {
      title: 'Total Rides',
      value: driverRides.filter(r => r.status === 'completed').length,
      icon: <CarOutlined />,
      color: '#FF6C2D',
      suffix: ' completed'
    },
    {
      title: 'Earnings',
      value: driverRides.filter(r => r.status === 'completed').reduce((sum, ride) => sum + ride.totalFare, 0).toFixed(2),
      icon: <DollarOutlined />,
      color: '#52C41A',
      prefix: 'N',
    },
    {
      title: 'Pending Rides',
      value: driverRides.filter(r => r.status === 'awaiting_driver_confirmation').length,
      icon: <ClockCircleOutlined />,
      color: '#1890FF',
      suffix: ' pending'
    },
    {
      title: 'Active Rides',
      value: driverRides.filter(r => ['accepted', 'in_progress', 'picked_up'].includes(r.status)).length,
      icon: <LoadingOutlined />,
      color: '#FFD700',
      suffix: ' active'
    },
  ];

  const getStatusTag = (status: string): React.ReactNode => {
    const statusConfig: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      pending: { 
        color: 'orange', 
        text: 'Pending',
        icon: <LoadingOutlined />
      },
      searching: { 
        color: 'blue', 
        text: 'Searching',
        icon: <LoadingOutlined />
      },
      accepted: { 
        color: 'blue', 
        text: 'Accepted',
        icon: <CheckCircleOutlined />
      },
      arrived: { 
        color: 'purple', 
        text: 'Arrived',
        icon: <CarOutlined />
      },
      picked_up: { 
        color: 'purple', 
        text: 'Picked Up',
        icon: <CarOutlined />
      },
      in_progress: { 
        color: 'cyan', 
        text: 'In Progress',
        icon: <LoadingOutlined />
      },
      completed: { 
        color: 'green', 
        text: 'Completed',
        icon: <CheckCircleOutlined />
      },
      cancelled: { 
        color: 'red', 
        text: 'Cancelled',
        icon: <CloseCircleOutlined />
      }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    return (
      <Tag 
        color={config.color} 
        icon={config.icon}
        className="flex items-center gap-1"
      >
        {config.text}
      </Tag>
    );
  };

  const handleAcceptRide = async (rideId: string) => {
    setActionLoading(true);
    try {
      const response = await acceptRide(rideId);
      if (response.success) {
        setDriverRides(prevRides =>
          prevRides.map(ride =>
            ride._id === rideId ? { ...ride, status: 'accepted' } : ride
          )
        );
        message.success('Ride accepted successfully!');
      } else {
        message.error(response.message || 'Failed to accept ride');
      }
    } catch (error) {
      console.error('Error accepting ride:', error);
      message.error('Failed to accept ride');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineRide = (ride: Ride) => {
    setRideToDecline(ride);
    setIsDeclineModalVisible(true);
  };

  const confirmDeclineRide = () => {
    if (!rideToDecline) return;

    setActionLoading(true);
    // Simulate API call
    setTimeout(() => {
      setDriverRides(prevRides => 
        prevRides.map(ride => 
          ride._id === rideToDecline.id ? { ...ride, status: 'cancelled' } : ride
        )
      );
      message.success('Ride declined successfully!');
      setActionLoading(false);
      setIsDeclineModalVisible(false);
      setRideToDecline(null);
    }, 1000);
  };

  const pendingRidesColumns = [
    {
      title: 'Ride ID',
      dataIndex: '_id',
      key: '_id',
      render: (id: string) => <Text strong className="text-[#475467]">{id.substring(0, 8)}</Text>
    },
    {
      title: 'Date & Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => (
        <div className="flex items-center">
          <ClockCircleOutlined className="text-[#667085] mr-2" />
          <Text className="text-[#475467]">{new Date(date).toLocaleString()}</Text>
        </div>
      )
    },
    {
      title: 'Route',
      key: 'route',
      render: (_: any, record: RideType) => (
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <Text className="text-[#475467]">
              {record.pickupLocation.address}
            </Text>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
            <Text className="text-[#475467]">
              {record.destination.address}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Fare',
      dataIndex: 'totalFare',
      key: 'totalFare',
      render: (fare: number) => <Text strong className="text-[#475467]">N{fare.toFixed(2)}</Text>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: RideType) => (
        <Space>
          <Button
            type="primary"
            className="bg-green-500 hover:bg-green-600 border-0"
            onClick={() => handleAcceptRide(record._id)}
            loading={actionLoading}
          >
            Accept
          </Button>
          <Button
            type="default"
            danger
            onClick={() => handleDeclineRide({ id: record._id } as Ride)}
            loading={actionLoading}
          >
            Decline
          </Button>
        </Space>
      )
    }
  ];

  const activeAndCompletedRidesColumns = [
    {
      title: 'Ride ID',
      dataIndex: '_id',
      key: '_id',
      render: (id: string) => <Text strong className="text-[#475467]">{id.substring(0, 8)}</Text>
    },
    {
      title: 'Date & Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => (
        <div className="flex items-center">
          <ClockCircleOutlined className="text-[#667085] mr-2" />
          <Text className="text-[#475467]">{new Date(date).toLocaleString()}</Text>
        </div>
      )
    },
    {
      title: 'Route',
      key: 'route',
      render: (_: any, record: RideType) => (
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <Text className="text-[#475467]">
              {record.pickupLocation.address}
            </Text>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
            <Text className="text-[#475467]">
              {record.destination.address}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Fare',
      dataIndex: 'totalFare',
      key: 'totalFare',
      render: (fare: number) => <Text strong className="text-[#475467]">N{fare.toFixed(2)}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status as RideStatus)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: RideType) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            className="text-[#1890FF] hover:text-[#1890FF]/80"
            onClick={() => navigate(`/driver-dashboard/rides/${record._id}`)}
          >
            View
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">          
            <div>
             <h3 className="text-gray-800 text-2xl font-bold">Welcome Back, {userName}! 👋</h3>
             <p className="text-gray-600">Manage your rides and earnings</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Spin size="large" tip="Loading your rides..." />
          </div>
        ) : (
          <>
        {/* Stats Grid */}
        <Row gutter={[24, 24]} className="mb-8">
          {driverStats.map((stat, index) => (
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
                      border: `1px solid ${stat.color}30`
                    }}
                  >
                    <div style={{ color: stat.color, fontSize: '20px' }}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Pending Rides */}
        <Card className="border-0 shadow-sm rounded-2xl mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-900 font-bold text-lg mb-0">
              New Ride Requests
            </h3>
            <Button
              type="link"
              icon={<HistoryOutlined />}
              className="text-orange-500! hover:text-orange-600!"
              onClick={() => navigate('/driver-dashboard/rides')}
            >
              View All Rides
            </Button>
          </div>
          <Table
            dataSource={driverRides.filter(ride => ride.status === 'awaiting_driver_confirmation')}
            columns={pendingRidesColumns}
            pagination={{ pageSize: 5 }}
            rowKey="id"
            className="mt-4"
          />
        </Card>

        {/* Active and Completed Rides (Driver's History) */}
        <Card className="border-0 shadow-sm rounded-2xl mt-10!">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-900 font-bold text-lg mb-0">
              Your Active & Completed Rides
            </h3>
          </div>
          <Table
            dataSource={driverRides.filter(ride => ['accepted', 'in_progress', 'picked_up', 'completed'].includes(ride.status))}
            columns={activeAndCompletedRidesColumns}
            pagination={{ pageSize: 5 }}
            rowKey="id"
            className="mt-4"
          />
        </Card>
         </>
        )}
      </div>

      {/* Decline Ride Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <WarningOutlined className="text-red-500" />
            <span>Decline Ride</span>
          </div>
        }
        open={isDeclineModalVisible}
        onCancel={() => setIsDeclineModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsDeclineModalVisible(false)}>
            Go Back
          </Button>,
          <Button
            key="submit"
            danger
            loading={loading}
            onClick={confirmDeclineRide}
            icon={<CloseCircleOutlined />}
          >
            Yes, Decline Ride
          </Button>,
        ]}
      >
        {rideToDecline && (
          <div className="py-4">
            <Text>Are you sure you want to decline this ride request?</Text>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <Text strong>Ride ID:</Text>
                <Text>{rideToDecline.id}</Text>
              </div>
              <div className="flex justify-between items-center mb-2">
                <Text strong>From:</Text>
                <Text>{rideToDecline.pickup}</Text>
              </div>
              <div className="flex justify-between items-center mb-2">
                <Text strong>To:</Text>
                <Text>{rideToDecline.destination}</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text strong>Fare:</Text>
                <Text strong className="text-gray-900">N{rideToDecline.fare.toFixed(2)}</Text>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Text type="secondary" className="text-sm">
                Note: Declining a ride will make it available to other drivers.
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DriverDashboard;
