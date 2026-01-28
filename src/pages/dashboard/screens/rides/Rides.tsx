import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Typography,
  Card,
  Input,
  Tooltip,
  Dropdown,
  Menu,
  Row,
  Col,
  DatePicker,
  Select,
  Empty,
  Spin,
  Tag,
  Space,
  Modal
} from 'antd';
import {
  MoreOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  CarOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import toast from 'react-hot-toast';
import rideService from '@/services/rideService';

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface RideOrder {
  _id: string;
  pickupLocation: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  destination: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'awaiting_driver_confirmation' | 'searching' | 'arrived' | 'picked_up';
  rideType: 'car' | 'motorcycle' | 'bicycle';
  totalFare: number;
  createdAt: string;
  distance?: number;
  estimatedDuration?: number;
  acceptedAt?: string;
  pickedUpAt?: string;
  startedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  instructions?: string;
  paymentMethod?: string;
}

type RideStatus = RideOrder['status'];

const RideOrders: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<RideOrder[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<any>(null);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [rideToCancel, setRideToCancel] = useState<RideOrder | null>(null);
  const [selectedRide, setSelectedRide] = useState<RideOrder | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [updatingRide, setUpdatingRide] = useState<string | null>(null);

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch rides for the logged-in user
      const response = await rideService.getUserRides();
      
      if (response?.success && Array.isArray(response.rides)) {
        const formattedRides = response.rides.map((ride: any) => ({
          ...ride,
          createdAt: typeof ride.createdAt === 'string' ? ride.createdAt : new Date(ride.createdAt).toISOString(),
        }));
        setOrders(formattedRides);
      } else {
        toast.error('Failed to fetch rides');
        setOrders([]);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch rides');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Status configuration similar to UserDashboard
  const getStatusTag = (status: RideStatus): React.ReactNode => {
    const statusConfig: Record<RideStatus, { color: string; text: string; icon: React.ReactNode }> = {
      pending: { 
        color: 'orange', 
        text: 'Pending',
        icon: <LoadingOutlined />
      },
      awaiting_driver_confirmation: { 
        color: 'orange', 
        text: 'Awaiting Driver',
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
    
    const config = statusConfig[status] || statusConfig.pending;
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

  // Handle cancel ride
  const handleCancelRide = (ride: RideOrder) => {
    setRideToCancel(ride);
    setIsCancelModalVisible(true);
  };

  const handleViewRide = (ride: RideOrder) => {
    setSelectedRide(ride);
    setIsViewModalVisible(true);
  };

  const confirmCancelRide = async () => {
    if (!rideToCancel) return;

    setCancelling(true);
    try {
      const response = await rideService.cancelRide(rideToCancel._id);
      if (response?.success) {
        const updatedOrders = orders.map(order => 
          order._id === rideToCancel._id ? { ...order, status: 'cancelled' as RideStatus } : order
        );
        setOrders(updatedOrders);
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
      const response = await rideService.updateRideStatus(rideId, 'picked_up');
      if (response?.success) {
        const updatedOrders = orders.map(order => 
          order._id === rideId ? { ...order, status: 'picked_up' as RideStatus, pickedUpAt: new Date().toISOString() } : order
        );
        setOrders(updatedOrders);
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
      const response = await rideService.updateRideStatus(rideId, 'completed');
      if (response?.success) {
        const updatedOrders = orders.map(order => 
          order._id === rideId ? { ...order, status: 'completed' as RideStatus, completedAt: new Date().toISOString() } : order
        );
        setOrders(updatedOrders);
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

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const searchMatch = !searchText || 
      order.pickupLocation.address.toLowerCase().includes(searchText.toLowerCase()) ||
      order.destination.address.toLowerCase().includes(searchText.toLowerCase());

    const statusMatch = statusFilter === 'all' || order.status === statusFilter;

    // Date filter
    let dateMatch = true;
    if (dateFilter && dateFilter[0] && dateFilter[1]) {
      const orderDate = dayjs(order.createdAt);
      const startDate = dayjs(dateFilter[0]);
      const endDate = dayjs(dateFilter[1]);
      dateMatch = orderDate.isBetween(startDate, endDate, null, '[]');
    }

    return searchMatch && statusMatch && dateMatch;
  });

  const handleRefresh = () => {
    fetchOrders();
  };

  const handleViewDetails = (orderId: string) => {
    navigate(`/rides/${orderId}`);
  };

  const columns = [
    {
      title: 'Ride ID',
      dataIndex: '_id',
      key: '_id',
      width: 120,
      render: (id: string) => (
        <Text strong className="text-[#475467]">{id.slice(-6).toUpperCase()}</Text>
      )
    },
    {
      title: 'Date & Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => (
        <div className="flex items-center">
          <ClockCircleOutlined className="text-[#667085] mr-2" />
          <Text className="text-[#475467]">{dayjs(date).format('MMM D, h:mm A')}</Text>
        </div>
      ),
      sorter: (a: RideOrder, b: RideOrder) => 
        dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: 'Route',
      key: 'route',
      width: 300,
      render: (_: any, record: RideOrder) => (
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <Tooltip title={record.pickupLocation.address}>
              <Text className="text-[#475467] truncate" style={{ maxWidth: '150px' }}>
                {record.pickupLocation.address}
              </Text>
            </Tooltip>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
            <Tooltip title={record.destination.address}>
              <Text className="text-[#475467] truncate" style={{ maxWidth: '150px' }}>
                {record.destination.address}
              </Text>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'rideType',
      key: 'rideType',
      width: 100,
      render: (type: string) => (
        <Text className="text-[#475467] capitalize">{type}</Text>
      ),
      filters: [
        { text: 'Bicycle', value: 'bicycle' },
        { text: 'Motorcycle', value: 'motorcycle' },
        { text: 'Car', value: 'car' },
      ],
      onFilter: (value: any, record: RideOrder) => record.rideType === value,
    },
    {
      title: 'Fare',
      dataIndex: 'totalFare',
      key: 'totalFare',
      width: 100,
      render: (fare: number) => (
        <Text strong className="text-[#475467]">₦{fare?.toLocaleString() || '0'}</Text>
      ),
      sorter: (a: RideOrder, b: RideOrder) => (a.totalFare || 0) - (b.totalFare || 0),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: getStatusTag,
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Accepted', value: 'accepted' },
        { text: 'In Progress', value: 'in_progress' },
        { text: 'Completed', value: 'completed' },
        { text: 'Cancelled', value: 'cancelled' },
        { text: 'Picked Up', value: 'picked_up' },
        { text: 'Arrived', value: 'arrived' },
      ],
      onFilter: (value: any, record: RideOrder) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: RideOrder) => {
        const isCancellable = ['pending', 'awaiting_driver_confirmation'].includes(record.status);
        const isAccepted = record.status === 'accepted';
        const isPickedUp = record.status === 'picked_up';
        const isInProgress = record.status === 'in_progress';
        
        return (
          <Space align="center">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              className="text-[#1890FF] hover:text-[#1890FF]/80"
              onClick={() => handleViewRide(record)}
            >
              View
            </Button>
            
            {isCancellable && (
              <Button 
                type="text" 
                danger 
                icon={<CloseCircleOutlined />}
                onClick={() => handleCancelRide(record)}
              >
                Cancel
              </Button>
            )}
            
            {isAccepted && (
              <>
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded border border-blue-200">
                  <LoadingOutlined className="text-blue-500 animate-spin text-xs" />
                  <Text className="text-xs text-blue-700 font-medium">Arriving soon</Text>
                </div>
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<CheckCircleOutlined />} 
                  loading={updatingRide === record._id}
                  onClick={() => handleDriverArrived(record._id)}
                  className="bg-green-500 border-green-500 hover:bg-green-600"
                >
                  Driver Arrived
                </Button>
              </>
            )}
            
            {(isPickedUp || isInProgress) && (
              <>
                <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 rounded border border-orange-200">
                  <Text className="text-xs text-orange-700 font-medium">
                    {isPickedUp ? '🚗 En route' : '🚗 In progress'}
                  </Text>
                </div>
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<CheckCircleOutlined />} 
                  loading={updatingRide === record._id}
                  onClick={() => handleCompleteRide(record._id)}
                  className="bg-green-500 border-green-500 hover:bg-green-600"
                >
                  Complete Ride
                </Button>
              </>
            )}
            
            {/* Additional actions dropdown */}
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item 
                    key="details"
                    onClick={() => handleViewDetails(record._id)}
                  >
                    Full Details
                  </Menu.Item>
                  <Menu.Item 
                    key="track"
                    disabled={!['accepted', 'in_progress', 'picked_up'].includes(record.status)}
                  >
                    Live Track
                  </Menu.Item>
                  <Menu.Item 
                    key="contact"
                  >
                    Contact Driver
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item 
                    key="reorder"
                    onClick={() => navigate('/order-ride')}
                  >
                    Reorder Similar Ride
                  </Menu.Item>
                </Menu>
              }
              trigger={['click']}
            >
              <Button 
                type="text" 
                icon={<MoreOutlined />}
                className="hover:bg-gray-100"
              />
            </Dropdown>
          </Space>
        );
      }
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-800 text-2xl font-bold">Ride Orders</h3>
              <p className="text-gray-600">Manage all ride requests</p>
            </div>
            <Button
              type="primary"
              onClick={() => navigate('/order-ride')}
              className="mt-4 md:mt-0"
            >
              + New Ride
            </Button>
          </div>

          {/* Filters */}
          <Card className="shadow-sm mb-6">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={8}>
                <Input
                  placeholder="Search pickup or destination..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Status"
                  className="w-full h-[53px]!"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  allowClear
                  suffixIcon={<FilterOutlined />}
                >
                  <Option value="all">All Status</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="awaiting_driver_confirmation">Awaiting Driver</Option>
                  <Option value="searching">Searching</Option>
                  <Option value="accepted">Accepted</Option>
                  <Option value="arrived">Arrived</Option>
                  <Option value="picked_up">Picked Up</Option>
                  <Option value="in_progress">In Progress</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <RangePicker
                  className="w-full h-[53px]!"
                  placeholder={['Start Date', 'End Date']}
                  value={dateFilter}
                  onChange={setDateFilter}
                  format="MMM D, YYYY"
                />
              </Col>
              <Col xs={24} md={4}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  className="w-full h-[53px]! text-white border-none hover:bg-primary/80"
                >
                  Refresh
                </Button>
              </Col>
            </Row>
          </Card>
        </div>

        {/* Table */}
        <Card className="shadow-sm border-0">
          <Table
            columns={columns}
            dataSource={filteredOrders}
            rowKey="_id"
            loading={loading}
            className='custom-table'
            scroll={{ x: 1200 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} rides`
            }}
            rowClassName={(record) => 
              record.status === 'cancelled' ? 'bg-red-50' : ''
            }
            locale={{
              emptyText: loading ? <Spin /> : <Empty description="No rides found" />
            }}
          />
        </Card>

        {/* View Ride Modal */}
        <Modal
          title="Ride Details"
          open={isViewModalVisible}
          onCancel={() => setIsViewModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsViewModalVisible(false)}>
              Close
            </Button>,
            <Button 
              key="full" 
              type="primary"
              onClick={() => {
                if (selectedRide) {
                  handleViewDetails(selectedRide._id);
                }
              }}
            >
              View Full Details
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

        {/* Cancel Ride Modal */}
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
    </div>
  );
};

export default RideOrders;