import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Table, Tag, Space, Modal, message, Spin, Descriptions } from 'antd';
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
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStore } from '@/global/store';
import { getDriverRides, acceptRide, Ride as RideType } from '../../../../services/rideService';


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
  notes?: string;
  duration?: number; // Estimated duration in minutes (optional)
}

const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isDeclineModalVisible, setIsDeclineModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedRide, setSelectedRide] = useState<RideType | null>(null);
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

  const handleViewRide = (ride: RideType) => {
    setSelectedRide(ride);
    setIsViewModalVisible(true);
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
          <Button
            type="text"
            icon={<EyeOutlined />}
            className="text-[#1890FF] hover:text-[#1890FF]/80"
            onClick={() => handleViewRide(record)}
          >
            View
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
            onClick={() => handleViewRide(record)}
          >
            View Details
          </Button>          
        </Space>
      )
    }
  ];

  // Function to format date
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

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
            rowKey="_id"
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
            rowKey="_id"
            className="mt-4"
          />
        </Card>
         </>
        )}
      </div>

      {/* View Ride Details Modal */}
     <Modal
        title={
          <div className="flex items-center gap-2">
            <EyeOutlined className="text-blue-500" />
            <span>Ride Details</span>
          </div>
        }
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>,    
        ]}
        width={700}
        className="ride-details-modal"
      >
        {selectedRide && (
          <div className="py-4">
            <Descriptions 
              bordered 
              column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              size="middle"
            >
              <Descriptions.Item label="Ride ID" span={2}>
                <Text strong className="break-all">{selectedRide._id}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Status" span={2}>
                {getStatusTag(selectedRide.status)}
              </Descriptions.Item>
              
              <Descriptions.Item label="Rider" span={2}>
                <div className="flex flex-col gap-2 sm:gap-1">
                  {/* Rider Name */}
                  <div className="flex items-center gap-2">
                    <UserOutlined className="min-w-[16px]" />
                    <Text className="truncate">
                      {typeof selectedRide.userId === 'object' 
                        ? selectedRide.userId.fullname 
                        : 'N/A'}
                    </Text>
                  </div>
                  
                  {/* Rider Phone Number - Added this section */}
                  {typeof selectedRide.userId === 'object' && selectedRide.userId.phone && (
                    <div className="flex items-center gap-2">
                     
                      {/* Optional: Add click to call on mobile */}
                      <a 
                        href={`tel:${selectedRide.userId.phone}`}
                        className="ml-2  text-gray-500 hover:text-blue-700 hidden sm:inline"
                      >
                        <PhoneOutlined />
                      </a>
                      <Text className="truncate">
                        {selectedRide.userId.phone}
                      </Text>
                    </div>
                  )}
                </div>
              </Descriptions.Item>
              
              <Descriptions.Item label="Created Date">
                <div className="flex items-center gap-2">
                  <CalendarOutlined className="min-w-[16px]" />
                  <Text className="truncate">{formatDate(selectedRide.createdAt).date}</Text>
                </div>
              </Descriptions.Item>
              
              <Descriptions.Item label="Created Time">
                <div className="flex items-center gap-2">
                  <ClockCircleOutlined className="min-w-[16px]" />
                  <Text className="truncate">{formatDate(selectedRide.createdAt).time}</Text>
                </div>
              </Descriptions.Item>
              
              <Descriptions.Item label="Total Fare">
                <Text strong className="text-lg whitespace-nowrap">N{selectedRide.totalFare.toFixed(2)}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Pickup Location" span={2}>
                <div className="flex items-start gap-2">
                  <EnvironmentOutlined className="text-green-500 mt-1 min-w-[16px]" />
                  <div className="min-w-0">
                    <Text strong className="break-words">{selectedRide.pickupLocation.address}</Text>
                    {(selectedRide.pickupLocation as any).landmark && (
                      <div>
                        <Text type="secondary" className="text-sm break-words">
                          Landmark: {(selectedRide.pickupLocation as any).landmark}
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              </Descriptions.Item>
              
              <Descriptions.Item label="Destination" span={2}>
                <div className="flex items-start gap-2">
                  <EnvironmentOutlined className="text-red-500 mt-1 min-w-[16px]" />
                  <div className="min-w-0">
                    <Text strong className="break-words">{selectedRide.destination.address}</Text>
                    {(selectedRide.destination as any).landmark && (
                      <div>
                        <Text type="secondary" className="text-sm break-words">
                          Landmark: {(selectedRide.destination as any).landmark}
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              </Descriptions.Item>
              
              {selectedRide.distance && (
                <Descriptions.Item label="Distance">
                  <Text className="whitespace-nowrap">{selectedRide.distance} km</Text>
                </Descriptions.Item>
              )}
              
              {selectedRide.duration && (
                <Descriptions.Item label="Estimated Duration">
                  <Text className="whitespace-nowrap">{selectedRide.duration} mins</Text>
                </Descriptions.Item>
              )}
              
              {selectedRide.paymentMethod && (
                <Descriptions.Item label="Payment Method">
                  <Tag color="blue" className="truncate">{selectedRide.paymentMethod}</Tag>
                </Descriptions.Item>
              )}
              
              {selectedRide.notes && (
                <Descriptions.Item label="Special Instructions" span={2}>
                  <div className="p-2 bg-gray-50 rounded border">
                    <Text className="break-words">{selectedRide.notes}</Text>
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

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