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
  Image,
} from 'antd';
import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  UserOutlined,
  EnvironmentOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import adminCharterOrderService from '@/services/admin/charter/CharterAdminOrders';

const { Title, Text } = Typography;

type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  vehicleType: string;
  capacity: number;
  thumbnail?: string;
  status: string;
  features?: string[];
  fuelType?: string;
}

interface Order {
  _id: string;
  userId: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  pickupLocation: string;
  destination: string;
  status: OrderStatus;
  vehicleNeeded: Vehicle;
  passengers?: number;
  specialRequests?: string;
  tripDate?: string;
  tripTime?: string;
  createdAt: string;
}

type ActionType = 'accept' | 'decline' | 'start' | 'complete' | 'delete' | null;

const CharterAdminOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [searchText, setSearchText] = useState('');
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await adminCharterOrderService.getAllCharterOrders();

      if (response.success && response.orders) {
        // If vehicleNeeded is a string, convert it to an object or handle accordingly
        setAllOrders(
          response.orders.map((order: any) => ({
            ...order,
            vehicleNeeded: typeof order.vehicleNeeded === 'string'
              ? { _id: order.vehicleNeeded } // minimal Vehicle object, adjust as needed
              : order.vehicleNeeded,
          }))
        );
      } else {
        toast.error('Failed to fetch orders');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: OrderStatus): React.ReactNode => {
    const statusConfig: Record<string, { color: string; text: string; icon?: React.ReactNode }> = {
      pending: { color: 'orange', text: 'Pending', icon: <ClockCircleOutlined /> },
      accepted: { color: 'blue', text: 'Accepted', icon: <CheckCircleOutlined /> },
      in_progress: { color: 'cyan', text: 'In Progress', icon: <CarOutlined /> },
      completed: { color: 'green', text: 'Completed', icon: <CheckCircleOutlined /> },
      cancelled: { color: 'red', text: 'Cancelled', icon: <CloseCircleOutlined /> },
    };

    const config = statusConfig[status];
    return (
      <Tag color={config?.color} icon={config?.icon} className="flex items-center gap-1">
        {config?.text}
      </Tag>
    );
  };

  const getFilteredOrders = () => {
    let filtered = allOrders;

    // Filter by status
    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(r => r.status === 'pending');
        break;
      case 'accepted':
        filtered = filtered.filter(r => r.status === 'accepted');
        break;
      case 'in_progress':
        filtered = filtered.filter(r => r.status === 'in_progress');
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
        r.user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        r.user.email.toLowerCase().includes(searchText.toLowerCase()) ||
        r.user.phone.includes(searchText) ||
        r.pickupLocation.toLowerCase().includes(searchText.toLowerCase()) ||
        r.destination.toLowerCase().includes(searchText.toLowerCase()) ||
        r._id.includes(searchText) ||
        r.vehicleNeeded?.make?.toLowerCase().includes(searchText.toLowerCase()) ||
        r.vehicleNeeded?.model?.toLowerCase().includes(searchText.toLowerCase()) ||
        r.vehicleNeeded?.licensePlate?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered;
  };

  const showActionModal = (order: Order, action: ActionType) => {
    setSelectedOrder(order);
    setActionType(action);
    setModalVisible(true);
  };

  const handleAction = async () => {
    if (!selectedOrder || !actionType) return;

    setActionLoading(true);
    setModalVisible(false);

    try {
      let response;
      switch (actionType) {
        case 'accept':
          response = await adminCharterOrderService.acceptCharterOrder(selectedOrder._id);
          if (response.success) toast.success('Order accepted successfully');
          break;
        case 'decline':
          response = await adminCharterOrderService.declineCharterOrder(selectedOrder._id);
          if (response.success) toast.success('Order declined');
          break;
        case 'start':
          response = await adminCharterOrderService.startCharterOrder(selectedOrder._id);
          if (response.success) toast.success('Ride started');
          break;
        case 'complete':
          response = await adminCharterOrderService.completeCharterOrder(selectedOrder._id);
          if (response.success) toast.success('Order completed');
          break;
        case 'delete':
          response = await adminCharterOrderService.deleteCharterOrder(selectedOrder._id);
          if (response.success) toast.success('Order deleted successfully');
          break;
      }

      if (response?.success) {
        await fetchOrders();
      } else {
        toast.error(response?.message || `Failed to ${actionType} order`);
      }
    } catch (error: any) {
      console.error(`${actionType} order error:`, error);
      toast.error(error.message || `Failed to ${actionType} order`);
    } finally {
      setActionLoading(false);
      setSelectedOrder(null);
      setActionType(null);
    }
  };

  const getModalContent = () => {
    if (!selectedOrder) return null;

    return (
      <div className="py-2">
        <Text>
          {actionType === 'delete' 
            ? 'Are you sure you want to delete this order? This action cannot be undone.'
            : `Are you sure you want to ${actionType} this order?`
          }
        </Text>
        <div className={`mt-3 p-3 rounded ${actionType === 'delete' ? 'bg-red-50' : 'bg-gray-50'}`}>
          <p><strong>Customer:</strong> {selectedOrder.user.name}</p>
          <p><strong>Vehicle:</strong> {selectedOrder.vehicleNeeded?.make} {selectedOrder.vehicleNeeded?.model} ({selectedOrder.vehicleNeeded?.year})</p>
          <p><strong>Vehicle Type:</strong> {selectedOrder.vehicleNeeded?.vehicleType}</p>
          <p><strong>Capacity:</strong> {selectedOrder.vehicleNeeded?.capacity} seats</p>
          <p><strong>Pickup:</strong> {selectedOrder.pickupLocation}</p>
          <p><strong>Destination:</strong> {selectedOrder.destination}</p>
          {selectedOrder.passengers && <p><strong>Passengers:</strong> {selectedOrder.passengers}</p>}
          {selectedOrder.tripDate && (
            <p><strong>Trip Date:</strong> {dayjs(selectedOrder.tripDate).format('MMM D, YYYY')} {selectedOrder.tripTime}</p>
          )}
          {selectedOrder.specialRequests && (
            <p><strong>Special Requests:</strong> {selectedOrder.specialRequests}</p>
          )}
        </div>
      </div>
    );
  };

  const ordersColumns = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      key: '_id',
      render: (id: string) => <Text strong className="text-[#475467]">{id.slice(-6).toUpperCase()}</Text>,
      width: 100,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <div className="flex items-center">
          <ClockCircleOutlined className="text-[#667085] mr-2" />
          <Text className="text-[#475467]">{dayjs(date).format('MMM D, YYYY')}</Text>
        </div>
      ),
      width: 120,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_: any, record: Order) => (
        <div className="flex items-center">
          <UserOutlined className="text-[#667085] mr-2 flex-shrink-0" />
          <div>
            <Text className="text-[#475467] block">{record.user.name}</Text>
            <Text type="secondary" className="text-xs">{record.user.email}</Text>
            <Text type="secondary" className="text-xs block">{record.user.phone}</Text>
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: 'Vehicle',
      key: 'vehicle',
      render: (_: any, record: Order) => {
        const vehicle = record.vehicleNeeded;
        
        // Handle case where vehicle is not properly populated
        if (!vehicle || (typeof vehicle === 'string')) {
          return <Text type="secondary">N/A</Text>;
        }
        
        return (
          <div className="flex items-center gap-2">
            {(vehicle as Vehicle)?.thumbnail ? (
              <Image
                src={(vehicle as Vehicle).thumbnail}
                alt={(vehicle as Vehicle).vehicleType}
                width={40}
                height={40}
                className="object-cover rounded"
                preview={false}
              />
            ) : (
              <CarOutlined className="text-gray-400 text-xl" />
            )}
            <div>
              <div className="font-medium capitalize">{(vehicle as Vehicle)?.vehicleType || 'N/A'}</div>
              <div className="text-xs text-gray-500">
                {(vehicle as Vehicle)?.make || 'N/A'} {(vehicle as Vehicle)?.model || ''} ({(vehicle as Vehicle)?.year || 'N/A'})
              </div>
              <div className="text-xs text-gray-400">
                {(vehicle as Vehicle)?.licensePlate || 'N/A'} • {(vehicle as Vehicle)?.capacity || 0} seats • {(vehicle as Vehicle)?.color || 'N/A'}
              </div>
            </div>
          </div>
        );
      },
      width: 220,
    },
    {
      title: 'Route',
      key: 'route',
      render: (_: any, record: Order) => (
        <div className="space-y-1">
          <div className="flex items-start">
            <EnvironmentOutlined className="text-green-500 mr-2 mt-1 flex-shrink-0" />
            <Text className="text-[#475467] text-sm">{record.pickupLocation}</Text>
          </div>
          <div className="flex items-start">
            <EnvironmentOutlined className="text-red-500 mr-2 mt-1 flex-shrink-0" />
            <Text className="text-[#475467] text-sm">{record.destination}</Text>
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: 'Trip Details',
      key: 'tripDetails',
      render: (_: any, record: Order) => (
        <div>
          <div className="text-sm">
            <UserOutlined className="text-[#667085] mr-1 text-xs" />
            {record.passengers || 1} passengers
          </div>
          {record.tripDate && (
            <div className="text-xs text-gray-500 mt-1">
              {dayjs(record.tripDate).format('MMM D, YYYY')} {record.tripTime}
            </div>
          )}
          {record.specialRequests && (
            <div className="text-xs text-gray-400 italic mt-1">
              "{record.specialRequests.substring(0, 30)}..."
            </div>
          )}
        </div>
      ),
      width: 150,
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
      width: 220,
      render: (_: any, record: Order) => {
        const isPending = record.status === 'pending';
        const isInProgress = record.status === 'in_progress';
        const isAccepted = record.status === 'accepted';
        const isCompleted = record.status === 'completed';
        const isCancelled = record.status === 'cancelled';

        return (
          <Space wrap size="small">
            {isPending && (
              <>
                <Button
                  type="primary"
                  size="small"
                  className="bg-blue-500 hover:bg-blue-600 border-0"
                  onClick={() => showActionModal(record, 'accept')}
                  loading={actionLoading && selectedOrder?._id === record._id && actionType === 'accept'}
                >
                  Accept
                </Button>
                <Button
                  type="default"
                  danger
                  size="small"
                  onClick={() => showActionModal(record, 'decline')}
                  loading={actionLoading && selectedOrder?._id === record._id && actionType === 'decline'}
                >
                  Decline
                </Button>
              </>
            )}
            
            {isAccepted && (
              <Button
                type="primary"
                size="small"
                className="bg-green-500 hover:bg-green-600 border-0"
                onClick={() => showActionModal(record, 'start')}
                loading={actionLoading && selectedOrder?._id === record._id && actionType === 'start'}
              >
                Start Ride
              </Button>
            )}

            {isInProgress && (
              <Button
                type="primary"
                size="small"
                className="bg-green-500 hover:bg-green-600 border-0"
                onClick={() => showActionModal(record, 'complete')}
                loading={actionLoading && selectedOrder?._id === record._id && actionType === 'complete'}
              >
                Complete
              </Button>
            )}

            {(isCompleted || isCancelled) && (
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => showActionModal(record, 'delete')}
                loading={actionLoading && selectedOrder?._id === record._id && actionType === 'delete'}
              >
                Delete
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Title level={2} className="text-gray-800">Charter Orders</Title>
          <Text className="text-gray-600">View and manage all charter orders requested by customers.</Text>
        </div>

        <Card className="border-0 shadow-sm rounded-2xl">
          {/* Search Bar */}
          <div className="mb-6">
            <Input
              placeholder="Search by name, email, phone, location, or vehicle details..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ maxWidth: '500px' }}
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
                    All Orders
                    <Tag color="blue" className="ml-1">
                      {allOrders.length}
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
                      {allOrders.filter(r => r.status === 'pending').length}
                    </Tag>
                  </span>
                ),
              },
              {
                key: 'accepted',
                label: (
                  <span className="flex items-center gap-2">
                    <CheckCircleOutlined />
                    Accepted
                    <Tag color="blue" className="ml-1">
                      {allOrders.filter(r => r.status === 'accepted').length}
                    </Tag>
                  </span>
                ),
              },
              {
                key: 'in_progress',
                label: (
                  <span className="flex items-center gap-2">
                    <CarOutlined />
                    In Progress
                    <Tag color="cyan" className="ml-1">
                      {allOrders.filter(r => r.status === 'in_progress').length}
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
                      {allOrders.filter(r => r.status === 'completed').length}
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
                      {allOrders.filter(r => r.status === 'cancelled').length}
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
              dataSource={getFilteredOrders()}
              columns={ordersColumns}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              rowKey="_id"
              className="mt-4"
              scroll={{ x: 1600 }}
              locale={{
                emptyText: 'No orders found',
              }}
            />
          )}
        </Card>
      </div>

      {/* Action Confirmation Modal */}
      <Modal
        title={
          <span className="flex items-center gap-2">
            {actionType === 'delete' ? (
              <DeleteOutlined className="text-red-500" />
            ) : actionType === 'accept' ? (
              <CheckCircleOutlined className="text-blue-500" />
            ) : actionType === 'decline' ? (
              <CloseCircleOutlined className="text-red-500" />
            ) : actionType === 'start' ? (
              <CarOutlined className="text-green-500" />
            ) : actionType === 'complete' ? (
              <CheckCircleOutlined className="text-green-500" />
            ) : null}
            <span>
              {actionType === 'accept' && 'Accept Order'}
              {actionType === 'decline' && 'Decline Order'}
              {actionType === 'start' && 'Start Ride'}
              {actionType === 'complete' && 'Complete Order'}
              {actionType === 'delete' && 'Delete Order'}
            </span>
          </span>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedOrder(null);
          setActionType(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setModalVisible(false);
              setSelectedOrder(null);
              setActionType(null);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="confirm"
            type={actionType === 'delete' ? 'primary' : 'primary'}
            danger={actionType === 'delete' || actionType === 'decline'}
            loading={actionLoading}
            onClick={handleAction}
            className={
              actionType === 'accept' ? 'bg-blue-500 hover:bg-blue-600 border-0' :
              actionType === 'start' ? 'bg-green-500 hover:bg-green-600 border-0' :
              actionType === 'complete' ? 'bg-green-500 hover:bg-green-600 border-0' :
              ''
            }
          >
            {actionType === 'accept' && 'Accept Order'}
            {actionType === 'decline' && 'Decline Order'}
            {actionType === 'start' && 'Start Ride'}
            {actionType === 'complete' && 'Complete Order'}
            {actionType === 'delete' && 'Delete Order'}
          </Button>,
        ]}
        width={600}
      >
        {getModalContent()}
      </Modal>
    </div>
  );
};

export default CharterAdminOrders;