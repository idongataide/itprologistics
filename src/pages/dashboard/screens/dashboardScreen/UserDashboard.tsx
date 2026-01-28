import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Tabs,
  Modal,
  Spin,
} from 'antd';
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  CarOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  HistoryOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { useOnboardingStore } from '@/global/store';
import rideService from '@/services/rideService';

const { Title, Text } = Typography;

interface UserStat {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  prefix?: string;
  suffix?: string;
}

type RideStatus = 'pending' | 'accepted' | 'picked_up' | 'in_progress' | 'completed' | 'cancelled' | 'awaiting_driver_confirmation' | 'searching' | 'arrived';


interface DriverInfo {
  _id: string;
  userId: {
    phone: string;
    // add other user properties if needed
  };
  driverRating: number;
  licenseNumber: string;
  status: string;
  totalEarnings: number;
  totalTrips: number;
  address?: {
    street?: string;
    city?: string;
  };
  vehicleId?: string | { _id: string };
  createdAt?: string;
  updatedAt?: string;
}

interface Ride {
  _id: string;
  pickupLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  destination: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  status: RideStatus;
  totalFare: number;
  createdAt: string;
  rideType: 'bicycle' | 'motorcycle' | 'car';
  estimatedDuration?: number;
  driverId?: DriverInfo;
  acceptedAt?: string;
  pickedUpAt?: string;
  startedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  instructions?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  baseFare?: number;
  distanceFare?: number;
  distance?: number;
  vehicleId?: string | { _id: string };
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [rideToCancel, setRideToCancel] = useState<Ride | null>(null);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [updatingRide, setUpdatingRide] = useState<string | null>(null);
  const [allRides, setAllRides] = useState<Ride[]>([]);
  const { userName } = useOnboardingStore();

  // Fetch rides on mount
  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const response = await rideService.getUserRides();
      if (response?.success && Array.isArray(response.rides)) {
        // Convert createdAt to string if it's a Date object
        const ridesWithStringDates = response.rides.map((ride: any) => ({
          ...ride,
          createdAt: typeof ride.createdAt === 'string' ? ride.createdAt : ride.createdAt?.toISOString?.() || '',
        }));
        setAllRides(ridesWithStringDates);
      } else {
        toast.error('Failed to fetch rides');
        setAllRides([]);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch rides');
      setAllRides([]);
    } finally {
      setLoading(false);
    }
  };


  // User-specific stats
  const userStats: UserStat[] = [
    {
      title: 'Total Rides',
      value: allRides.length,
      icon: <ShoppingCartOutlined />,
      color: '#FF6C2D',
      suffix: ' rides'
    },
    {
      title: 'Completed',
      value: allRides.filter(r => r.status === 'completed').length,
      icon: <CheckCircleOutlined />,
      color: '#52C41A',
      suffix: ' completed'
    },
    {
      title: 'Active',
      value: allRides.filter(r => ['in_progress', 'picked_up', 'accepted', 'pending'].includes(r.status)).length,
      icon: <CarOutlined />,
      color: '#1890FF',
      suffix: ' active'
    },
    {
      title: 'Cancelled',
      value: allRides.filter(r => r.status === 'cancelled').length,
      icon: <CloseCircleOutlined />,
      color: '#FF4D4F',
      suffix: ' cancelled'
    }
  ];



  const getStatusTag = (status: RideStatus): React.ReactNode => {
    const statusConfig: Record<RideStatus, { color: string; text: string; icon: React.ReactNode }> = {
      pending: { 
        color: 'orange', 
        text: 'Pending',
        icon: <LoadingOutlined />
      },
      accepted: { 
        color: 'blue', 
        text: 'Accepted',
        icon: <CheckCircleOutlined />
      },
      in_progress: { 
        color: 'cyan', 
        text: 'In Progress',
        icon: <LoadingOutlined />
      },
      picked_up: { 
        color: 'cyan', 
        text: 'Picked Up',
        icon: <CarOutlined />
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
      },
      awaiting_driver_confirmation: {
        color: 'orange',
        text: 'Awaiting Driver',
        icon: <ClockCircleOutlined />
      },
      searching: {
        color: 'purple',
        text: 'Searching',
        icon: <LoadingOutlined />
      },
      arrived: {
        color: 'blue',
        text: 'Arrived',
        icon: <CarOutlined />
      }
    };
    
    const config = statusConfig[status];
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
      case 'active':
        return allRides.filter(r => ['pending', 'accepted', 'picked_up', 'in_progress'].includes(r.status));
      case 'completed':
        return allRides.filter(r => r.status === 'completed');
      case 'cancelled':
        return allRides.filter(r => r.status === 'cancelled');
      default:
        return allRides;
    }
  };

  const handleCancelRide = (ride: Ride) => {
    setRideToCancel(ride);
    setIsCancelModalVisible(true);
  };

  const handleViewRide = (ride: Ride) => {
    console.log(ride);
    setSelectedRide(ride);
    setIsViewModalVisible(true);
  };

  const confirmCancelRide = async () => {
    if (!rideToCancel) return;

    setCancelling(true);
    try {
      const response = await rideService.cancelRide(rideToCancel._id);
      if (response?.success) {
        const updatedRides = allRides.map(ride => 
          ride._id === rideToCancel._id ? { ...ride, status: 'cancelled' as RideStatus } : ride
        );
        setAllRides(updatedRides);
        setIsCancelModalVisible(false);
        setRideToCancel(null);
        toast.success('Ride cancelled successfully');
      } else {
        toast.error(response?.message || 'Failed to cancel ride');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel ride');
    } finally {
      setCancelling(false);
    }
  };

  const handleDriverArrived = async (rideId: string) => {
    setUpdatingRide(rideId);
    try {
      // Call API to update ride status
      const response = await rideService.updateRideStatus(rideId, 'picked_up');
      if (response?.success) {
        const updatedRides = allRides.map(ride => 
          ride._id === rideId ? { ...ride, status: 'picked_up' as RideStatus, pickedUpAt: new Date().toISOString() } : ride
        );
        setAllRides(updatedRides);
        toast.success('Driver arrival confirmed');
      } else {
        toast.error(response?.message || 'Failed to confirm driver arrival');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to confirm driver arrival');
    } finally {
      setUpdatingRide(null);
    }
  };

  const handleCompleteRide = async (rideId: string) => {
    setUpdatingRide(rideId);
    try {
      // Call API to complete ride
      const response = await rideService.updateRideStatus(rideId, 'completed');
      if (response?.success) {
        const updatedRides = allRides.map(ride => 
          ride._id === rideId ? { ...ride, status: 'completed' as RideStatus, completedAt: new Date().toISOString() } : ride
        );
        setAllRides(updatedRides);
        toast.success('Ride completed successfully');
      } else {
        toast.error(response?.message || 'Failed to complete ride');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete ride');
    } finally {
      setUpdatingRide(null);
    }
  };

  const columns = [
    {
      title: 'Ride ID',
      dataIndex: '_id',
      key: '_id',
      render: (id: string) => (
        <Text strong className="text-[#475467]">{id.slice(-6).toUpperCase()}</Text>
      )
    },
    {
      title: 'Date & Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <div className="flex items-center">
          <ClockCircleOutlined className="text-[#667085] mr-2" />
          <Text className="text-[#475467]">{dayjs(date).format('MMM D, h:mm A')}</Text>
        </div>
      )
    },
    {
      title: 'Route',
      key: 'route',
      render: (_: any, record: Ride) => (
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <Text className="text-[#475467] truncate" style={{ maxWidth: '150px' }}>
              {record.pickupLocation.address}
            </Text>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
            <Text className="text-[#475467] truncate" style={{ maxWidth: '150px' }}>
              {record.destination.address}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'rideType',
      key: 'rideType',
      render: (type: string) => (
        <Text className="text-[#475467] capitalize">{type}</Text>
      )
    },
    {
      title: 'Fare',
      dataIndex: 'totalFare',
      key: 'totalFare',
      render: (fare: number) => (
        <Text strong className="text-[#475467]">₦{fare?.toLocaleString() || '0'}</Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Ride) => {
        const isCancellable = ['pending', 'awaiting_driver_confirmation'].includes(record.status);
        const isAccepted = record.status === 'accepted';
        const isPickedUp = record.status === 'picked_up';
        const isInProgress = record.status === 'in_progress';
        
        return (
         <Space align="center">
          <Button type="text" icon={<EyeOutlined />} className="text-[#1890FF] hover:text-[#1890FF]/80" onClick={() => handleViewRide(record)}>View</Button>
          {isCancellable && <Button type="text" danger icon={<CloseCircleOutlined />} onClick={() => handleCancelRide(record)}>Cancel</Button>}
          {isAccepted && (
            <>
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded border border-blue-200">
                <LoadingOutlined className="text-blue-500 animate-spin text-xs" />
                <Text className="text-xs text-blue-700 font-medium">Arriving soon</Text>
              </div>
              <Button type="primary" size="small" icon={<CheckCircleOutlined />} loading={updatingRide === record._id} onClick={() => handleDriverArrived(record._id)} className="bg-green-500 border-green-500 hover:bg-green-600">Driver Arrived</Button>
            </>
          )}
          {(isPickedUp || isInProgress) && (
            <>
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 rounded border border-orange-200">
                <Text className="text-xs text-orange-700 font-medium">
                  {isPickedUp ? '🚗 En route' : '🚗 In progress'}
                </Text>
              </div>
              <Button type="primary" size="small" icon={<CheckCircleOutlined />} loading={updatingRide === record._id} onClick={() => handleCompleteRide(record._id)} className="bg-green-500 border-green-500 hover:bg-green-600">Complete Ride</Button>
            </>
          )}
        </Space>
        );
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 pt-15!">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">          
            <div>
              <h3 className="text-gray-800 text-2xl font-bold">Welcome Back, {userName}! 👋</h3>
              <p className="text-gray-600">Track your rides and manage your trips</p>
            </div>
            <Button
              type="primary"
              size="large"
              className="bg-gradient-to-r from-orange-500 to-red-500 border-0 hover:from-orange-600 hover:to-red-600 h-12 px-6 shadow-lg"
              icon={<ShoppingCartOutlined />}
              onClick={() => navigate('/rides/order-ride')}
            >
              Book New Ride
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <Row gutter={[24, 24]} className="mb-8">
          {userStats.map((stat, index) => (
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

        <Card className="border-0 shadow-sm rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <Title level={3} className="text-gray-900 mb-0">
              Your Rides
            </Title>
            <Button
              type="link"
              icon={<HistoryOutlined />}
              className="text-orange-500 hover:text-orange-600"
              onClick={() => navigate('/rides')}
            >
              View Full History
            </Button>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="custom-tabs"
            items={[
              {
                key: 'active',
                label: (
                  <span className="flex items-center gap-2">
                    <CarOutlined />
                    Active Rides
                    <Tag color="blue" className="ml-1">
                      {allRides.filter(r => ['pending', 'accepted', 'picked_up', 'in_progress'].includes(r.status)).length}
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
                      {allRides.filter(r => r.status === 'completed').length}
                    </Tag>
                  </span>
                ),
              },
              {
                key: 'cancelled',
                label: (
                  <span className="flex items-center gap-2">
                    <CloseCircleOutlined />
                    Cancelled
                    <Tag color="red" className="ml-1">
                      {allRides.filter(r => r.status === 'cancelled').length}
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
            rowKey="_id"
            className="mt-4"
            loading={loading}
            rowClassName={(record) => 
              record.status === 'cancelled' ? 'bg-red-50' : ''
            }
            locale={{
              emptyText: loading ? <Spin /> : 'No rides found'
            }}
          />
        </Card>

   
      </div>

      {/* Ride Details Modal */}
      <Modal
        title="Ride Details"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedRide && (
          <div className="space-y-6">
            {/* Ride Information */}
            <div className="border-b pb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Ride Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text className="text-gray-600 text-sm">Ride ID</Text>
                  <Text strong className="text-gray-900 block mt-1">
                    {selectedRide._id.slice(-6).toUpperCase()}
                  </Text>
                </div>
                <div>
                  <Text className="text-gray-600 text-sm">Status</Text>
                  <div className="mt-1">
                    {getStatusTag(selectedRide.status)}
                  </div>
                </div>
                <div>
                  <Text className="text-gray-600 text-sm">Ride Type</Text>
                  <Text strong className="text-gray-900 block mt-1 capitalize">
                    {selectedRide.rideType}
                  </Text>
                </div>
                <div>
                  <Text className="text-gray-600 text-sm">Date & Time</Text>
                  <Text strong className="text-gray-900 block mt-1">
                    {dayjs(selectedRide.createdAt).format('MMM D, YYYY h:mm A')}
                  </Text>
                </div>
              </div>
            </div>

            {/* Route Information */}
            <div className="border-b pb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Route</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <Text className="text-gray-600 text-sm">Pickup Location</Text>
                  </div>
                  <Text className="text-gray-900 block ml-5">
                    {selectedRide.pickupLocation.address}
                  </Text>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <Text className="text-gray-600 text-sm">Destination</Text>
                  </div>
                  <Text className="text-gray-900 block ml-5">
                    {selectedRide.destination.address}
                  </Text>
                </div>
              </div>
            </div>

            {/* Driver Information */}
            {selectedRide.driverId && ['accepted', 'in_progress', 'completed'].includes(selectedRide.status) && (
              <div className="border-b pb-4">
                <h4 className="font-semibold text-gray-900 mb-3">Driver Details</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-3">
                        <Text strong className="text-gray-900 block">
                          Driver ID: {selectedRide.driverId._id.slice(-6).toUpperCase()}
                        </Text>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-yellow-500">★</span>
                          <Text className="text-gray-700">
                            {selectedRide.driverId.driverRating || 'N/A'}
                          </Text>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <Text className="text-gray-600 text-sm">Phone</Text>
                          <Text className="text-gray-900 block">{selectedRide.driverId.userId.phone}</Text>
                        </div>
                        <div>
                          <Text className="text-gray-600 text-sm">License Number</Text>
                          <Text className="text-gray-900 block">{selectedRide.driverId.licenseNumber}</Text>
                        </div>                        
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Vehicle Information */}
            {selectedRide.vehicleId && ['accepted', 'in_progress', 'completed'].includes(selectedRide.status) && (
              <div className="border-b pb-4">
                <h4 className="font-semibold text-gray-900 mb-3">Vehicle Details</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Text className="text-gray-600 text-sm">Vehicle ID</Text>
                      <Text strong className="text-gray-900 block mt-1">
                        {typeof selectedRide.vehicleId === 'string'
                          ? selectedRide.vehicleId.slice(-6).toUpperCase()
                          : (selectedRide.vehicleId && typeof selectedRide.vehicleId === 'object' && ' _id' in selectedRide.vehicleId)
                            ? selectedRide.vehicleId._id.slice(-6).toUpperCase()
                            : ''}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status Timeline */}
            <div className="border-b pb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Timeline</h4>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5"></div>
                    <div className="w-0.5 h-8 bg-blue-200"></div>
                  </div>
                  <div>
                    <Text strong className="text-gray-900">Ride Requested</Text>
                    <Text className="text-gray-600 text-sm block">
                      {dayjs(selectedRide.createdAt).format('MMM D, YYYY h:mm A')}
                    </Text>
                  </div>
                </div>
                {selectedRide.acceptedAt && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5"></div>
                      <div className="w-0.5 h-8 bg-green-200"></div>
                    </div>
                    <div>
                      <Text strong className="text-gray-900">Driver Accepted</Text>
                      <Text className="text-gray-600 text-sm block">
                        {dayjs(selectedRide.acceptedAt).format('MMM D, YYYY h:mm A')}
                      </Text>
                    </div>
                  </div>
                )}
                {selectedRide.status === 'in_progress' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-orange-500 mt-1.5"></div>
                      <div className="w-0.5 h-8 bg-orange-200"></div>
                    </div>
                    <div>
                      <Text strong className="text-gray-900">Driver En Route</Text>
                      <Text className="text-gray-600 text-sm block">
                        Driver is on the way to your location
                      </Text>
                    </div>
                  </div>
                )}
                {selectedRide.status === 'completed' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5"></div>
                    </div>
                    <div>
                      <Text strong className="text-gray-900">Ride Completed</Text>
                      <Text className="text-gray-600 text-sm block">
                        {dayjs(selectedRide.pickedUpAt).format('MMM D, YYYY h:mm A')}
                      </Text>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fare Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Fare</h4>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <Text className="text-gray-600">Total Fare</Text>
                <Text strong className="text-2xl text-gray-900">
                  ₦{selectedRide.totalFare?.toLocaleString() || '0'}
                </Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ExclamationCircleOutlined className="text-red-500" />
            <span>Cancel Ride</span>
          </div>
        }
        open={isCancelModalVisible}
        onCancel={() => setIsCancelModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsCancelModalVisible(false)}>
            Go Back
          </Button>,
          <Button
            key="submit"
            danger
            loading={cancelling}
            onClick={confirmCancelRide}
            icon={<CloseCircleOutlined />}
          >
            Yes, Cancel Ride
          </Button>,
        ]}
      >
        {rideToCancel && (
          <div className="py-4">
            <Text>Are you sure you want to cancel this ride?</Text>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <Text strong>Ride ID:</Text>
                <Text>{rideToCancel._id.slice(-6).toUpperCase()}</Text>
              </div>
              <div className="flex justify-between items-center mb-2">
                <Text strong>From:</Text>
                <Text>{rideToCancel.pickupLocation.address}</Text>
              </div>
              <div className="flex justify-between items-center mb-2">
                <Text strong>To:</Text>
                <Text>{rideToCancel.destination.address}</Text>
              </div>
              <div className="flex justify-between items-center mb-2">
                <Text strong>Type:</Text>
                <Text className="capitalize">{rideToCancel.rideType}</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text strong>Fare:</Text>
                <Text strong className="text-gray-900">₦{rideToCancel.totalFare?.toLocaleString() || '0'}</Text>
              </div>
            </div>
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <Text type="secondary" className="text-sm">
                Note: Cancellation may be subject to fees if the driver is already en route.
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserDashboard;