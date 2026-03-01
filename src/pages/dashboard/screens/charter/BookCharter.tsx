import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  TimePicker,
  InputNumber,
  Select,
  Typography,
  Space,
  Spin,
  Table,
  Tag,
  Modal,
  Empty,
  Row,
  Col,
  Image,
} from 'antd';
import {
  CarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import charterService from '@/services/charterService';
import charterVehicleService from '@/services/charterVehicleService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

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
  pickupLocation: string;
  destination: string;
  status: OrderStatus;
  vehicleNeeded: Vehicle; // This is now an object, not a string
  passengers?: number;
  specialRequests?: string;
  tripDate?: string;
  tripTime?: string;
  createdAt: string;
}

const BookCharter: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);

  console.log('Vehicles state:', selectedVehicle);

  // Fetch user's orders and available vehicles on mount
  useEffect(() => {
    fetchUserOrders();
    fetchAvailableVehicles();
  }, []);

  const fetchUserOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await charterService.getUserCharterOrders();
      if (response.success && response.orders) {
        // Map vehicleNeeded from vehicle ID (string) to Vehicle object
        setOrders(
          response.orders.map((order: any) => ({
            ...order,
            vehicleNeeded:
              vehicles.find(v => v._id === order.vehicleNeeded) ||
              // fallback: create a minimal Vehicle object if not found
              {
                _id: order.vehicleNeeded,
                make: '',
                model: '',
                year: 0,
                licensePlate: '',
                color: '',
                vehicleType: '',
                capacity: 0,
                status: '',
              },
          }))
        );
      } else {
        toast.error(response.message || 'Failed to fetch orders');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchAvailableVehicles = async () => {
    setVehiclesLoading(true);
    try {
      const response = await charterVehicleService.getAvailableCharterVehicles();
      if (response.success && response.availableVehicles) {
        setVehicles(response.availableVehicles);
      }
    } catch (error: any) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setVehiclesLoading(false);
    }
  };

  const handleBookCharter = async (values: any) => {
    setLoading(true);
    try {
      const bookingData = {
        pickupLocation: values.pickupLocation,
        destination: values.destination,
        vehicleNeeded: values.vehicleNeeded, // This will be the vehicle ID
        passengers: values.passengers,
        
        specialRequests: values.specialRequests,
        tripDate: values.tripDate ? values.tripDate.format('YYYY-MM-DD') : undefined,
        tripTime: values.tripTime ? values.tripTime.format('HH:mm') : undefined,
      };

      const response = await charterService.bookCharter(bookingData);

      if (response.success) {
        toast.success('Charter booked successfully!');
        form.resetFields();
        setShowForm(false);
        fetchUserOrders();
      } else {
        toast.error(response.message || 'Failed to book charter');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to book charter');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = (order: Order) => {
    Modal.confirm({
      title: 'Cancel Order',
      icon: <ExclamationCircleOutlined className="text-red-500" />,
      content: (
        <div className="py-2">
          <Text>Are you sure you want to cancel this order?</Text>
          <div className="mt-3 p-3 bg-gray-50 rounded">
            <p><strong>Pickup:</strong> {order.pickupLocation}</p>
            <p><strong>Destination:</strong> {order.destination}</p>
            <p><strong>Status:</strong> {order.status}</p>
          </div>
        </div>
      ),
      okText: 'Yes, Cancel Order',
      okType: 'danger',
      cancelText: 'Go Back',
      onOk: async () => {
        try {
          const response = await charterService.cancelCharterOrder(order._id);
          if (response.success) {
            toast.success('Order cancelled successfully');
            fetchUserOrders();
          } else {
            toast.error(response.message || 'Failed to cancel order');
          }
        } catch (error: any) {
          toast.error(error.message || 'Failed to cancel order');
        }
      },
    });
  };

  const showVehicleDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleModalVisible(true);
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
      <Tag color={config?.color} icon={config?.icon} className="flex items-center gap-1 w-fit">
        {config?.text}
      </Tag>
    );
  };

  const getFilteredOrders = () => {
    if (activeTab === 'all') {
      return orders;
    }
    return orders.filter(order => order.status === activeTab);
  };

  const ordersColumns = [
    {
      title: 'Pickup Location',
      dataIndex: 'pickupLocation',
      key: 'pickupLocation',
      render: (location: string) => (
        <div className="flex items-start">
          <EnvironmentOutlined className="text-green-500 mr-2 mt-1 flex-shrink-0" />
          <Text className="text-[#475467]">{location || 'N/A'}</Text>
        </div>
      ),
      width: 180,
    },
    {
      title: 'Destination',
      dataIndex: 'destination',
      key: 'destination',
      render: (destination: string) => (
        <div className="flex items-start">
          <EnvironmentOutlined className="text-red-500 mr-2 mt-1 flex-shrink-0" />
          <Text className="text-[#475467]">{destination || 'N/A'}</Text>
        </div>
      ),
      width: 180,
    },
    {
      title: 'Vehicle',
      key: 'vehicle',
      render: (_: any, record: Order) => {
        const vehicle = record.vehicleNeeded;
        return (
          <div className="flex items-center gap-2">
            {vehicle?.thumbnail ? (
              <img 
                src={vehicle.thumbnail} 
                alt={vehicle.vehicleType}
                className="w-10 h-10 object-cover rounded"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <CarOutlined 
              className={`text-gray-400 ${vehicle?.thumbnail ? 'hidden' : ''}`} 
            />
            <div>
              <div className="font-medium capitalize">
                {vehicle?.vehicleType || 'N/A'}
              </div>
              <div className="text-xs text-gray-500">
                {vehicle?.make} {vehicle?.model} • {vehicle?.capacity} seats • {vehicle?.color}
              </div>
              {vehicle?.licensePlate && (
                <div className="text-xs text-gray-400">
                  Plate: {vehicle.licensePlate}
                </div>
              )}
            </div>
          </div>
        );
      },
      width: 220, // Increased width to accommodate more info
    },
    {
      title: 'Passengers',
      dataIndex: 'passengers',
      key: 'passengers',
      render: (passengers: number) => (
        <div className="flex items-center">
          <UserOutlined className="text-[#667085] mr-2" />
          <Text className="text-[#475467]">{passengers || 'N/A'}</Text>
        </div>
      ),
      width: 100,
    },
    {
      title: 'Trip Date',
      dataIndex: 'tripDate',
      key: 'tripDate',
      render: (date: string) => (
        <div className="flex items-center">
          <CalendarOutlined className="text-[#667085] mr-2" />
          <Text className="text-[#475467]">
            {date ? dayjs(date).format('MMM D, YYYY') : 'N/A'}
          </Text>
        </div>
      ),
      width: 130,
    },
    {
      title: 'Trip Time',
      dataIndex: 'tripTime',
      key: 'tripTime',
      render: (time: string) => (
        <div className="flex items-center">
          <ClockCircleOutlined className="text-[#667085] mr-2" />
          <Text className="text-[#475467]">{time || 'N/A'}</Text>
        </div>
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
      width: 120,
      render: (_: any, record: Order) => {
        const canCancel = ['pending', 'accepted'].includes(record.status);
        return canCancel ? (
          <Button
            type="text"
            danger
            size="small"
            onClick={() => handleCancelOrder(record)}
          >
            Cancel
          </Button>
        ) : null;
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Title level={2} className="text-gray-800 mb-0">Book Charter</Title>
            <Text className="text-gray-600">Book a charter vehicle for your trip</Text>
          </div>
          {!showForm && (
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              className="bg-blue-500 hover:bg-blue-600 border-0"
              onClick={() => setShowForm(true)}
            >
              Book New Charter
            </Button>
          )}
        </div>

        {/* Available Vehicles Banner */}
        {vehicles.length > 0 && !showForm && (
          <Card className="border-0 shadow-sm rounded-2xl mb-6">
            <div className="flex justify-between items-center mb-4">
              <Title level={5} className="text-gray-800 mb-0">Available Vehicles</Title>
              <Text className="text-gray-500">{vehicles.length} vehicles available</Text>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {vehicles.slice(0, 6).map(vehicle => (
                <div
                  key={vehicle._id}
                  className="border rounded-lg p-2 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => showVehicleDetails(vehicle)}
                >
                  {vehicle.thumbnail ? (
                    <img
                      src={vehicle.thumbnail}
                      alt={vehicle.vehicleType}
                      className="w-full h-16 object-cover rounded mb-2"
                    />
                  ) : (
                    <div className="w-full h-16 bg-gray-100 rounded mb-2 flex items-center justify-center">
                      <CarOutlined className="text-gray-400 text-xl" />
                    </div>
                  )}
                  <div className="text-xs font-medium capitalize truncate">
                    {vehicle.vehicleType}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {vehicle.make} {vehicle.model}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Booking Form */}
        {showForm && (
          <Card className="border-0 shadow-sm rounded-2xl mb-8">
            <div className="mb-6">
              <Title level={4} className="text-gray-800">New Charter Booking</Title>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleBookCharter}
              className="space-y-4"
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="pickupLocation"
                    label="Pickup Location"
                    rules={[{ required: true, message: 'Please enter pickup location' }]}
                  >
                    <Input
                      prefix={<EnvironmentOutlined />}
                      placeholder="Enter pickup location"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="destination"
                    label="Destination"
                    rules={[{ required: true, message: 'Please enter destination' }]}
                  >
                    <Input
                      prefix={<EnvironmentOutlined />}
                      placeholder="Enter destination"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="vehicleNeeded"
                    label="Select Vehicle"
                    rules={[{ required: true, message: 'Please select a vehicle' }]}
                  >
                    <Select
                      placeholder="Select a vehicle"
                      size="large"
                      loading={vehiclesLoading}
                      showSearch
                      optionFilterProp="children"
                      dropdownRender={(menu) => (
                        <>
                          {menu}
                          <div className="p-2 border-t">
                            <Button 
                              type="link" 
                              size="small" 
                              className="w-full"
                              onClick={() => setVehicleModalVisible(true)}
                            >
                              View All Available Vehicles
                            </Button>
                          </div>
                        </>
                      )}
                    >
                      {vehicles.map(vehicle => (
                        <Option key={vehicle._id} value={vehicle._id}>
                          <div className="flex items-center gap-2">
                            {vehicle.thumbnail ? (
                              <img 
                                src={vehicle.thumbnail} 
                                alt={vehicle.vehicleType}
                                className="w-8 h-8 object-cover rounded"
                              />
                            ) : (
                              <CarOutlined className="text-gray-400" />
                            )}
                            <div>
                              <div className="font-medium capitalize">{vehicle.vehicleType}</div>
                              <div className="text-xs text-gray-500">
                                {vehicle.make} {vehicle.model} • {vehicle.capacity} seats • {vehicle.color}
                              </div>
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="passengers"
                    label="Number of Passengers"
                    rules={[{ required: true, message: 'Please enter number of passengers' }]}
                  >
                    <InputNumber
                      min={1}
                      max={100}
                      placeholder="Number of passengers"
                      size="large"
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="tripDate"
                    label="Trip Date"
                  >
                    <DatePicker
                      format="YYYY-MM-DD"
                      placeholder="Select trip date"
                      size="large"
                      className="w-full"
                      disabledDate={(current) =>
                        current && current < dayjs().startOf('day')
                      }
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="tripTime"
                    label="Trip Time"
                  >
                    <TimePicker
                      format="HH:mm"
                      placeholder="Select trip time"
                      size="large"
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="specialRequests"
                label="Special Requests (Optional)"
              >
                <TextArea
                  rows={4}
                  placeholder="Any special requests or notes for the charter..."
                />
              </Form.Item>

              <Space className="w-full justify-end">
                <Button
                  size="large"
                  onClick={() => {
                    setShowForm(false);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={loading}
                  className="bg-blue-500 hover:bg-blue-600 border-0"
                >
                  Book Charter
                </Button>
              </Space>
            </Form>
          </Card>
        )}

        {/* Orders Section */}
        <Card className="border-0 shadow-sm rounded-2xl mt-10!">
          <div className="mb-6">
            <Title level={4} className="text-gray-800">Your Charter Orders</Title>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2 flex-wrap">
            <Button
              type={activeTab === 'all' ? 'primary' : 'default'}
              size="middle"
              onClick={() => setActiveTab('all')}
              className={activeTab === 'all' ? 'bg-blue-500 border-0' : ''}
            >
              All ({orders.length})
            </Button>
            <Button
              type={activeTab === 'pending' ? 'primary' : 'default'}
              size="middle"
              onClick={() => setActiveTab('pending')}
              icon={<ClockCircleOutlined />}
              className={activeTab === 'pending' ? 'bg-orange-500 border-0' : ''}
            >
              Pending ({orders.filter(o => o.status === 'pending').length})
            </Button>
            <Button
              type={activeTab === 'accepted' ? 'primary' : 'default'}
              size="middle"
              onClick={() => setActiveTab('accepted')}
              icon={<CheckCircleOutlined />}
              className={activeTab === 'accepted' ? 'bg-blue-500 border-0' : ''}
            >
              Accepted ({orders.filter(o => o.status === 'accepted').length})
            </Button>
            <Button
              type={activeTab === 'in_progress' ? 'primary' : 'default'}
              size="middle"
              onClick={() => setActiveTab('in_progress')}
              icon={<CarOutlined />}
              className={activeTab === 'in_progress' ? 'bg-cyan-500 border-0' : ''}
            >
              In Progress ({orders.filter(o => o.status === 'in_progress').length})
            </Button>
            <Button
              type={activeTab === 'completed' ? 'primary' : 'default'}
              size="middle"
              onClick={() => setActiveTab('completed')}
              icon={<CheckCircleOutlined />}
              className={activeTab === 'completed' ? 'bg-green-500 border-0' : ''}
            >
              Completed ({orders.filter(o => o.status === 'completed').length})
            </Button>
          </div>

          {/* Orders Table */}
          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <Spin size="large" />
            </div>
          ) : getFilteredOrders().length > 0 ? (
            <Table
              dataSource={getFilteredOrders()}
              columns={ordersColumns}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              rowKey="_id"
              className="mt-4"
              scroll={{ x: 1200 }}
              locale={{
                emptyText: 'No orders found',
              }}
            />
          ) : (
            <Empty
              description="No charter orders yet"
              style={{ marginTop: 50, marginBottom: 50 }}
            >
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                className="bg-blue-500 hover:bg-blue-600 border-0"
                onClick={() => setShowForm(true)}
              >
                Book Your First Charter
              </Button>
            </Empty>
          )}
        </Card>
      </div>

      {/* Vehicle Details Modal */}
      <Modal
        title="Available Vehicles"
        open={vehicleModalVisible}
        onCancel={() => setVehicleModalVisible(false)}
        footer={null}
        width={800}
      >
        {vehiclesLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map(vehicle => (
              <Card
                key={vehicle._id}
                className="border rounded-lg hover:shadow-md transition-shadow"
                size="small"
              >
                <div className="flex gap-3">
                  {vehicle.thumbnail ? (
                    <Image
                      src={vehicle.thumbnail}
                      alt={vehicle.vehicleType}
                      width={80}
                      height={80}
                      className="object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                      <CarOutlined className="text-gray-400 text-2xl" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium capitalize">{vehicle.vehicleType}</div>
                    <div className="text-sm">{vehicle.make} {vehicle.model} ({vehicle.year})</div>
                    <div className="text-xs text-gray-500 mt-1">
                      <div>License: {vehicle.licensePlate}</div>
                      <div>Color: {vehicle.color}</div>
                      <div>Capacity: {vehicle.capacity} seats</div>
                      {vehicle.fuelType && <div>Fuel: {vehicle.fuelType}</div>}
                    </div>
                    {vehicle.features && vehicle.features.length > 0 && (
                      <div className="mt-2">
                        {vehicle.features.slice(0, 2).map((feature, idx) => (
                          <Tag key={idx} color="blue">
                            {feature.replace(/_/g, ' ')}
                          </Tag>
                        ))}
                        {vehicle.features.length > 2 && (
                          <Tag>+{vehicle.features.length - 2}</Tag>
                        )}
                      </div>
                    )} 
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookCharter;