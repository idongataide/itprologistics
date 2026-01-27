import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  message,
  Tabs,
} from 'antd';
import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  EyeOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getDriverRides, acceptRide, declineRide, Ride as RideType } from '../../../../services/rideService';


const DriverRides: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [isDeclineModalVisible, setIsDeclineModalVisible] = useState(false);
  const [rideToDecline, setRideToDecline] = useState<RideType | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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

  const getStatusTag = (status: string): React.ReactNode => {
    const statusConfig: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      pending: {
        color: 'orange',
        text: 'Pending',
        icon: <LoadingOutlined />
      },
      awaiting_driver_confirmation: {
        color: 'orange',
        text: 'Awaiting Confirmation',
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

  const getFilteredRides = () => {
    switch (activeTab) {
      case 'pending':
        return driverRides.filter(r => r.status === 'awaiting_driver_confirmation');
      case 'active':
        return driverRides.filter(r => ['accepted', 'picked_up', 'in_progress', 'arrived'].includes(r.status));
      case 'completed':
        return driverRides.filter(r => r.status === 'completed');
      case 'declined': // 'cancelled' status for driver's declined rides
        return driverRides.filter(r => r.status === 'cancelled');
      default:
        return driverRides;
    }
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

  const handleDeclineRide = (ride: RideType) => {
    setRideToDecline(ride);
    setIsDeclineModalVisible(true);
  };

  const confirmDeclineRide = async () => {
    if (!rideToDecline) return;

    setActionLoading(true);
    try {
      const response = await declineRide(rideToDecline._id);
      if (response.success) {
        setDriverRides(prevRides =>
          prevRides.map(ride =>
            ride._id === rideToDecline._id ? { ...ride, status: 'cancelled' } : ride
          )
        );
        message.success('Ride declined successfully!');
        setIsDeclineModalVisible(false);
        setRideToDecline(null);
      } else {
        message.error(response.message || 'Failed to decline ride');
      }
    } catch (error) {
      console.error('Error declining ride:', error);
      message.error('Failed to decline ride');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
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
      title: 'Rider',
      key: 'rider',
      render: (_: any, record: RideType) => (
        <Text className="text-[#475467]">{typeof record.userId === 'object' ? record.userId.fullname : 'N/A'}</Text>
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
      render: (status: string) => getStatusTag(status)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: RideType) => {
        if (record.status === 'awaiting_driver_confirmation') {
          return (
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
                onClick={() => handleDeclineRide(record)}
                loading={actionLoading}
              >
                Decline
              </Button>
            </Space>
          );
        } else {
          return (
            <Button
              type="text"
              icon={<EyeOutlined />}
              className="text-[#1890FF] hover:text-[#1890FF]/80"
              onClick={() => navigate(`/driver-dashboard/rides/${record._id}`)}
            >
              View
            </Button>
          );
        }
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h3 className="text-gray-800 text-lg font-bold mb-0">All Driver Rides</h3>
          <p className="text-gray-600">View and manage all your ride requests and history.</p>
        </div>

        <Card className="border-0 shadow-sm rounded-2xl">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="custom-tabs"
            items={[
              {
                key: 'pending',
                label: (
                  <span className="flex items-center gap-2">
                    <ClockCircleOutlined />
                    Pending Rides
                    <Tag color="orange" className="ml-1">
                      {driverRides.filter(r => r.status === 'awaiting_driver_confirmation').length}
                    </Tag>
                  </span>
                ),
              },
              {
                key: 'active',
                label: (
                  <span className="flex items-center gap-2">
                    <CarOutlined />
                    Active Rides
                    <Tag color="blue" className="ml-1">
                      {driverRides.filter(r => ['accepted', 'picked_up', 'in_progress', 'arrived'].includes(r.status)).length}
                    </Tag>
                  </span>
                ),
              },
              {
                key: 'completed',
                label: (
                  <span className="flex items-center gap-2">
                    <CheckCircleOutlined />
                    Completed
                    <Tag color="green" className="ml-1">
                      {driverRides.filter(r => r.status === 'completed').length}
                    </Tag>
                  </span>
                ),
              },
              {
                key: 'declined',
                label: (
                  <span className="flex items-center gap-2">
                    <CloseCircleOutlined />
                    Declined
                    <Tag color="red" className="ml-1">
                      {driverRides.filter(r => r.status === 'cancelled').length}
                    </Tag>
                  </span>
                ),
              }
            ]}
          />

          <Table
            dataSource={getFilteredRides()}
            columns={columns}
            pagination={{ pageSize: 5 }}
            rowKey="id"
            className="mt-4"
            rowClassName={(record) => 
              record.status === 'cancelled' ? 'bg-red-50' : ''
            }
          />
        </Card>
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

export default DriverRides;
