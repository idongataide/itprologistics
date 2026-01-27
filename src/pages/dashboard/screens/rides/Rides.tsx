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
  Badge,
  Row,
  Col,
  DatePicker,
  Select,
  Empty,
  Spin
} from 'antd';
import {
  MoreOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  CarOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import toast from 'react-hot-toast';
import rideService from '@/services/rideService';

dayjs.extend(relativeTime);

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
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  rideType: 'car' | 'motorcycle' | 'bicycle';
  totalFare: number;
  createdAt: string;
  distance?: number;
  estimatedDuration?: number;
}

const RideOrders: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<RideOrder[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<any>(null);

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
        setOrders(response.rides);
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

  // Status colors
  const statusColors = {
    pending: '#FF6C2D',
    accepted: '#3B82F6',
    in_progress: '#8B5CF6',
    completed: '#10B981',
    cancelled: '#EF4444'
  };

  const statusLabels = {
    pending: 'Pending',
    accepted: 'Accepted',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled'
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
      title: 'Date & Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => (
        <div className="space-y-1 flex items-center">
          <div className="text-sm text-gray-900 me-2">
            {dayjs(date).format('MMM D, YYYY')}
          </div>
          <div className="text-xs text-gray-500 flex items-center">
            <ClockCircleOutlined className="mr-1" />
            {dayjs(date).format('h:mm A')}
          </div>          
        </div>
      ),
      sorter: (a: RideOrder, b: RideOrder) => 
        dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: 'Pickup',
      dataIndex: 'pickupLocation',
      key: 'pickup',
      width: 250,
      render: (location: { address: string; coordinates: { lat: number; lng: number } }) => (
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <Tooltip title={location.address}>
              <Text className="text-sm text-gray-900 truncate">
                {location.address}
              </Text>
            </Tooltip>
          </div>          
        </div>
      ),
    },
    {
      title: 'Destination',
      dataIndex: 'destination',
      key: 'destination',
      width: 250,
      render: (location: { address: string; coordinates: { lat: number; lng: number } }) => (
        <div className="flex items-center">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
          <Tooltip title={location.address}>
            <Text className="text-sm text-gray-900 truncate">
              {location.address}
            </Text>
          </Tooltip>
        </div>
      ),
    },
  
    {
      title: 'Fare',
      key: 'fare',
      width: 100,
      render: (record: RideOrder) => (
        <div className="text-sm text-gray-900">
          ₦{record.totalFare?.toLocaleString() || '0'}
        </div>
      ),
      sorter: (a: RideOrder, b: RideOrder) => (a.totalFare || 0) - (b.totalFare || 0),
    },
    {
      title: 'Type',
      key: 'type',
      width: 100,
      render: (record: RideOrder) => (
        <div className="text-sm text-gray-900">{record.rideType}</div>
      ),
      sorter: (a: RideOrder, b: RideOrder) => {
        const rideTypeOrder = ['bicycle', 'motorcycle', 'car'];
        return rideTypeOrder.indexOf(a.rideType) - rideTypeOrder.indexOf(b.rideType);
      },
      filters: [
        { text: 'Bicycle', value: 'bicycle' },
        { text: 'Motorcycle', value: 'motorcycle' },
        { text: 'Car', value: 'car' },
      ],
      onFilter: (value: any, record: RideOrder) => record.rideType === value,
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        filters: [
          { text: 'Pending', value: 'pending' },
          { text: 'Accepted', value: 'accepted' },
          { text: 'In Progress', value: 'in_progress' },
          { text: 'Completed', value: 'completed' },
          { text: 'Cancelled', value: 'cancelled' },
        ],
        onFilter: (value: any, record: RideOrder) => record.status === value,
        render: (status: keyof typeof statusColors) => (
          <Badge
            color={statusColors[status]}
            text={
              <span className="text-sm">
                {statusLabels[status]}
              </span>
            }
          />
        ),
      },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_: any, record: RideOrder) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item 
                key="view"
                onClick={() => handleViewDetails(record._id)}
              >
                View Details
              </Menu.Item>
              <Menu.Item 
                key="track"
                disabled={record.status !== 'in_progress'}
              >
                Live Track
              </Menu.Item>
              <Menu.Item 
                key="contact"
              >
                Contact Rider
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
      ),
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
                  placeholder="Search pickup, destination, or customer..."
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
                  <Option value="accepted">Accepted</Option>
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
            scroll={{ x: 1000 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} rides`
            }}
            rowClassName="hover:bg-gray-50 cursor-pointer"
            onRow={(record) => ({
              onClick: () => handleViewDetails(record._id)
            })}
            locale={{
              emptyText: <Empty description="No rides found" />
            }}
          />
        </Card>

      </div>
    </div>
  );
};

export default RideOrders;