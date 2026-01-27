import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Tabs,
  Modal,
  Spin,
  Input,
} from 'antd';
import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import adminRideService from '@/services/admin/adminRideService';

const { Title, Text } = Typography;

type RideStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

interface Ride {
  _id: string;
  userId: string;
  userName?: string;
  phoneNumber?: string;
  driverId?: string;
  driverName?: string;
  pickupLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  destination: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  status: RideStatus;
  rideType: 'bicycle' | 'motorcycle' | 'car';
  totalFare: number;
  distance?: number;
  estimatedDuration?: number;
  createdAt: string;
}

interface Driver {
  _id: string;
  name: string;
  status: 'active' | 'inactive' | 'on_ride';
  vehicle?: {
    make: string;
    model: string;
    licensePlate: string;
    color: string;
  };
  phone?: string;
  rating?: number;
  totalTrips?: number;
}

const AdminRides: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [isCompleteDeclineModalVisible, setIsCompleteDeclineModalVisible] = useState(false);
  const [rideToAction, setRideToAction] = useState<Ride | null>(null);
  const [actionType, setActionType] = useState<'complete' | 'decline' | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [allRides, setAllRides] = useState<Ride[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchText, setSearchText] = useState('');

  // Fetch rides and drivers on mount
  useEffect(() => {
    fetchRidesAndDrivers();
  }, []);

  const fetchRidesAndDrivers = async () => {
    setLoading(true);
    try {
      const [ridesResponse, driversResponse] = await Promise.all([
        adminRideService.getAllRides(),
        adminRideService.getAllDrivers(),
      ]);

      if (ridesResponse.success && ridesResponse.rides) {
        setAllRides(ridesResponse.rides);
      } else {
        toast.error('Failed to fetch rides');
      }

      if (driversResponse.success && driversResponse.drivers) {
        setDrivers(driversResponse.drivers);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch rides and drivers');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: RideStatus | Driver['status']): React.ReactNode => {
    const statusConfig: Record<string, { color: string; text: string; icon?: React.ReactNode }> = {
      pending: { color: 'orange', text: 'Pending', icon: <ClockCircleOutlined /> },
      accepted: { color: 'blue', text: 'Accepted', icon: <CheckCircleOutlined /> },
      in_progress: { color: 'cyan', text: 'In Progress', icon: <ClockCircleOutlined /> },
      completed: { color: 'green', text: 'Completed', icon: <CheckCircleOutlined /> },
      cancelled: { color: 'red', text: 'Cancelled', icon: <ExclamationCircleOutlined /> },
      active: { color: 'green', text: 'Active', icon: <CheckCircleOutlined /> },
      inactive: { color: 'red', text: 'Inactive', icon: <ExclamationCircleOutlined /> },
      on_ride: { color: 'blue', text: 'On Ride', icon: <CarOutlined /> },
    };

    const config = statusConfig[status];
    return (
      <Tag color={config?.color} icon={config?.icon} className="flex items-center gap-1">
        {config?.text}
      </Tag>
    );
  };

  const getFilteredRides = () => {
    let filtered = allRides;

    // Filter by status
    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(r => r.status === 'pending');
        break;
      case 'active':
        filtered = filtered.filter(r => ['accepted', 'in_progress'].includes(r.status));
        break;
      case 'completed':
        filtered = filtered.filter(r => r.status === 'completed');
        break;
      case 'cancelled':
        filtered = filtered.filter(r => r.status === 'cancelled');
        break;
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(r =>
        r.pickupLocation.address.toLowerCase().includes(searchText.toLowerCase()) ||
        r.destination.address.toLowerCase().includes(searchText.toLowerCase()) ||
        r._id.includes(searchText) ||
        r.userName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered;
  };

  const handleAssignRide = async (ride: Ride) => {
    setRideToAction(ride);
    setActionLoading(true);
    try {
      // Fetch available drivers that match the ride type
      const response = await adminRideService.getAvailableDrivers(ride._id);
      if (response.success && response.drivers) {
        setDrivers(response.drivers);
      } else {
        toast.error('Failed to fetch available drivers');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch available drivers');
    } finally {
      setActionLoading(false);
      setIsAssignModalVisible(true);
    }
  };

  const confirmAssignRide = async (driverId: string) => {
    if (!rideToAction || !driverId) return;

    setActionLoading(true);
    try {
      const response = await adminRideService.assignDriverToRide(rideToAction._id, driverId);

      if (response.success) {
        // Update local state
        const driverName = drivers.find(d => d._id === driverId)?.name;
        setAllRides(prevRides =>
          prevRides.map(r =>
            r._id === rideToAction._id
              ? { ...r, status: 'accepted', driverId, driverName }
              : r
          )
        );

        // Update driver status
        setDrivers(prevDrivers =>
          prevDrivers.map(d =>
            d._id === driverId ? { ...d, status: 'on_ride' } : d
          )
        );

        toast.success(`Ride assigned to ${driverName} successfully!`);
        setIsAssignModalVisible(false);
        setRideToAction(null);
      } else {
        toast.error(response.message || 'Failed to assign driver');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign driver');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteDeclineRide = (ride: Ride, action: 'complete' | 'decline') => {
    setRideToAction(ride);
    setActionType(action);
    setIsCompleteDeclineModalVisible(true);
  };

  const confirmCompleteDeclineRide = async () => {
    if (!rideToAction || !actionType) return;

    setActionLoading(true);
    try {
      let response;
      if (actionType === 'complete') {
        response = await adminRideService.completeRide(rideToAction._id);
      } else {
        response = await adminRideService.declineRide(rideToAction._id);
      }

      if (response.success) {
        // Update local state
        setAllRides(prevRides =>
          prevRides.map(r =>
            r._id === rideToAction._id
              ? { ...r, status: actionType === 'complete' ? 'completed' : 'cancelled' }
              : r
          )
        );

        // If ride is completed and has a driver, set driver back to active
        if (actionType === 'complete' && rideToAction.driverId) {
          setDrivers(prevDrivers =>
            prevDrivers.map(d =>
              d._id === rideToAction.driverId ? { ...d, status: 'active' } : d
            )
          );
        }

        toast.success(`Ride ${actionType === 'complete' ? 'completed' : 'declined'} successfully!`);
        setIsCompleteDeclineModalVisible(false);
        setRideToAction(null);
        setActionType(null);
      } else {
        toast.error(response.message || `Failed to ${actionType} ride`);
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${actionType} ride`);
    } finally {
      setActionLoading(false);
    }
  };

  const ridesColumns = [
    {
      title: 'Ride ID',
      dataIndex: '_id',
      key: '_id',
      render: (id: string) => <Text strong className="text-[#475467]">{id.slice(-6).toUpperCase()}</Text>,
      width: 100,
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
      ),
      width: 150,
    },
    {
      title: 'Rider Info',
      key: 'rider',
      render: (_: any, record: Ride) => (
        <div>
          <Text strong className="text-[#475467] block">{record.userName || 'N/A'}</Text>
          <Text type="secondary" className="text-xs">{record.phoneNumber || 'N/A'}</Text>
        </div>
      ),
      width: 150,
    },
    {
      title: 'Driver',
      dataIndex: 'driverName',
      key: 'driver',
      render: (driver: string) => <Text className="text-[#475467]">{driver || 'Unassigned'}</Text>,
      width: 120,
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
      ),
      width: 200,
    },
    {
      title: 'Type',
      dataIndex: 'rideType',
      key: 'rideType',
      render: (type: string) => (
        <Text className="text-[#475467] capitalize">{type}</Text>
      ),
      width: 100,
    },
    {
      title: 'Fare',
      dataIndex: 'totalFare',
      key: 'totalFare',
      render: (fare: number) => (
        <Text strong className="text-[#475467]">₦{fare?.toLocaleString() || '0'}</Text>
      ),
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Ride) => {
        const isAssignable = record.status === 'pending';
        const isCompletableDeclinable = ['accepted', 'in_progress'].includes(record.status);

        return (
          <Space wrap>
            {isAssignable && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="small"
                className="bg-green-500 hover:bg-green-600 border-0"
                onClick={() => handleAssignRide(record)}
              >
                Assign
              </Button>
            )}
            {isCompletableDeclinable && (
              <>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  size="small"
                  className="bg-blue-500 hover:bg-blue-600 border-0"
                  onClick={() => handleCompleteDeclineRide(record, 'complete')}
                >
                  Complete
                </Button>
                <Button
                  type="default"
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleCompleteDeclineRide(record, 'decline')}
                >
                  Decline
                </Button>
              </>
            )}
            {!isAssignable && !isCompletableDeclinable && (
              <Text type="secondary" className="text-xs">Not actionable</Text>
            )}
          </Space>
        );
      },
      width: 200,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Title level={2} className="text-gray-800">Manage All Rides</Title>
          <Text className="text-gray-600">View and manage all ride requests across the platform.</Text>
        </div>

        <Card className="border-0 shadow-sm rounded-2xl">
          {/* Search Bar */}
          <div className="mb-6">
            <Input
              placeholder="Search by ride ID, rider name, pickup or destination..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ maxWidth: '400px' }}
              allowClear
            />
          </div>

          {/* Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="custom-tabs"
            items={[
              {
                key: 'all',
                label: (
                  <span className="flex items-center gap-2">
                    <CarOutlined />
                    All Rides
                    <Tag color="blue" className="ml-1">
                      {allRides.length}
                    </Tag>
                  </span>
                ),
              },
              {
                key: 'pending',
                label: (
                  <span className="flex items-center gap-2">
                    <ClockCircleOutlined />
                    Pending
                    <Tag color="orange" className="ml-1">
                      {allRides.filter(r => r.status === 'pending').length}
                    </Tag>
                  </span>
                ),
              },
              {
                key: 'active',
                label: (
                  <span className="flex items-center gap-2">
                    <CarOutlined />
                    Active
                    <Tag color="blue" className="ml-1">
                      {allRides.filter(r => ['accepted', 'in_progress'].includes(r.status)).length}
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
                    <ExclamationCircleOutlined />
                    Cancelled
                    <Tag color="red" className="ml-1">
                      {allRides.filter(r => r.status === 'cancelled').length}
                    </Tag>
                  </span>
                ),
              },
            ]}
          />

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Spin size="large" />
            </div>
          ) : (
            <Table
              dataSource={getFilteredRides()}
              columns={ridesColumns}
              pagination={{ pageSize: 8, showSizeChanger: true }}
              rowKey="_id"
              className="mt-4"
              scroll={{ x: 1400 }}
              locale={{
                emptyText: 'No rides found',
              }}
            />
          )}
        </Card>
      </div>

      {/* Assign Driver Modal */}
     <Modal
        title={
          <div className="flex items-center gap-2">
            <PlusOutlined className="text-blue-500" />
            <span>Assign Driver to Ride {rideToAction?._id.slice(-6).toUpperCase()}</span>
          </div>
        }
        open={isAssignModalVisible}
        onCancel={() => setIsAssignModalVisible(false)}
        footer={null}
        width={800}
      >
        {rideToAction && (
          <div className="py-4">
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Text strong className="block mb-2">Ride Details:</Text>
              <Text className="text-sm">
                Type: <span className="capitalize font-semibold">{rideToAction.rideType}</span>
              </Text>
            </div>
            
            <Text className="mb-4 block">
              Select an available driver with matching vehicle type:
            </Text>
            
            <Table
              dataSource={drivers}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
              scroll={{ x: true }}
              onRow={(record) => ({
                onClick: () => confirmAssignRide(record._id),
                className: "cursor-pointer hover:bg-blue-50"
              })}
              columns={[
                {
                  title: 'Driver',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text, record) => (
                    <div>
                      <Text strong className="block">{text}</Text>
                      <Text type="secondary" className="text-xs">
                        {record.phone}
                      </Text>
                    </div>
                  ),
                  sorter: (a, b) => a.name.localeCompare(b.name),
                },
                {
                  title: 'Vehicle',
                  key: 'vehicle',
                  render: (_, record) => (
                    record.vehicle ? (
                      <div>
                        <Text className="text-sm block">
                          {record.vehicle.make} {record.vehicle.model}
                        </Text>
                        <Text type="secondary" className="text-xs block">
                          <span className="capitalize">{record.vehicle.vehicleType}</span> • {record.vehicle.licensePlate}
                        </Text>
                        <Text type="secondary" className="text-xs">
                          {record.vehicle.color}
                        </Text>
                      </div>
                    ) : (
                      <Text type="secondary" className="text-xs">No vehicle</Text>
                    )
                  ),
                  filters: [
                    { text: 'Economy', value: 'economy' },
                    { text: 'Premium', value: 'premium' },
                    { text: 'SUV', value: 'suv' },
                  ],
                  onFilter: (value, record) => record.vehicle?.vehicleType === value,
                },
                {
                  title: 'Rating & Trips',
                  key: 'performance',
                  render: (_, record) => (
                    <div>
                      <Text className="block">
                        ⭐ {record.rating || 0}/5
                      </Text>
                      <Text type="secondary" className="text-xs">
                        {record.totalTrips || 0} trips
                      </Text>
                    </div>
                  ),
                  sorter: (a, b) => (a.rating || 0) - (b.rating || 0),
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => getStatusTag(status),
                  filters: [
                    { text: 'Active', value: 'active' },
                    { text: 'Available', value: 'available' },
                    { text: 'Busy', value: 'busy' },
                  ],
                  onFilter: (value, record) => record.status === value,
                },
                {
                  title: 'Action',
                  key: 'action',
                  render: (_, record) => (
                    <Button 
                      type="primary" 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmAssignRide(record._id);
                      }}
                    >
                      Assign
                    </Button>
                  ),
                },
              ]}
              locale={{
                emptyText: (
                  <Text type="danger">
                    No active drivers available with a {rideToAction.rideType} vehicle.
                  </Text>
                )
              }}
            />
          </div>
        )}
      </Modal>

      {/* Complete/Decline Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ExclamationCircleOutlined className="text-red-500" />
            <span>Confirm {actionType === 'complete' ? 'Completion' : 'Decline'}</span>
          </div>
        }
        open={isCompleteDeclineModalVisible}
        onCancel={() => setIsCompleteDeclineModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsCompleteDeclineModalVisible(false)}>
            Go Back
          </Button>,
          <Button
            key="submit"
            type={actionType === 'complete' ? 'primary' : 'default'}
            danger={actionType === 'decline'}
            loading={actionLoading}
            onClick={confirmCompleteDeclineRide}
            icon={actionType === 'complete' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            className={actionType === 'complete' ? 'bg-blue-500 hover:bg-blue-600 border-0' : ''}
          >
            Confirm {actionType === 'complete' ? 'Complete' : 'Decline'}
          </Button>,
        ]}
      >
        {rideToAction && (
          <div className="py-4">
            <Text>Are you sure you want to {actionType} this ride?</Text>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <Text strong>Ride ID:</Text>
                <Text>{rideToAction._id.slice(-6).toUpperCase()}</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text strong>Rider:</Text>
                <Text>{rideToAction.userName || 'N/A'}</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text strong>Driver:</Text>
                <Text>{rideToAction.driverName || 'Unassigned'}</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text strong>From:</Text>
                <Text>{rideToAction.pickupLocation.address}</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text strong>To:</Text>
                <Text>{rideToAction.destination.address}</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text strong>Type:</Text>
                <Text className="capitalize">{rideToAction.rideType}</Text>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <Text strong>Fare:</Text>
                <Text strong className="text-gray-900">₦{rideToAction.totalFare?.toLocaleString() || '0'}</Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminRides;
