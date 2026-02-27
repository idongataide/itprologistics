import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Typography,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Popconfirm,
  Tooltip,
  Modal,
  Form,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  CarOutlined,
  UserOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Link} from 'react-router-dom';
import charterDriverService, { 
  CharterVehicle,
  CharterDriverDetail,
} from '@/services/admin/charter/charterDriverService';
import charterVehicleService from '@/services/admin/charter/charterVehicleService';
import CharterDriverDetailsModal from './DriverDetails';
import toast from 'react-hot-toast';
import { CiCircleInfo } from 'react-icons/ci';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

// Updated interface to match your API response
interface DriverData {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  userStatus: 'active' | 'inactive';
  role: string;
  createdAt: string;
  updatedAt: string;
  driverId: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  licenseNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  isVerified: boolean;
  totalTrips: number;
  experience?: number;
  specialLicenses?: string[];
  languages?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  vehicle?: CharterVehicle;
  vehicleId?: string | CharterVehicle;
  hasDriverDetails: boolean;
}

const CharterDriverList: React.FC = () => {
  const [drivers, setDrivers] = useState<DriverData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDriver, setSelectedDriver] = useState<CharterDriverDetail | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  
  // Vehicle Assignment States
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState<CharterVehicle[]>([]);
  const [assigningDriver, setAssigningDriver] = useState<DriverData | null>(null);
  const [assignForm] = Form.useForm();
  const [vehicleLoading, setVehicleLoading] = useState(false);

  useEffect(() => {
    fetchDrivers();
    fetchAvailableVehicles();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await charterDriverService.getCharterDrivers();
      console.log('API Response:', response); // Debug log
      
      if (response.success && response.drivers) {
        // The API already returns the transformed data structure
        setDrivers(
          response.drivers.map((driver: any) => ({
            _id: driver._id,
            userId: driver.userId,
            name: driver.name,
            email: driver.email,
            phone: driver.phone,
            userStatus: driver.userStatus,
            role: driver.role,
            createdAt: driver.createdAt,
            updatedAt: driver.updatedAt,
            driverId: driver.driverId,
            status: driver.status,
            licenseNumber: driver.licenseNumber,
            address: driver.address,
            isVerified: driver.isVerified,
            totalTrips: driver.totalTrips,
            experience: driver.experience,
            specialLicenses: driver.specialLicenses,
            languages: driver.languages,
            emergencyContact: driver.emergencyContact,
            vehicle: driver.vehicle,
            vehicleId: driver.vehicleId,
            hasDriverDetails: driver.hasDriverDetails,
          }))
        );
      } else {
        toast.error('Failed to fetch drivers');
      }
    } catch (error: any) {
      console.error('Error fetching drivers:', error);
      toast.error(error.message || 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableVehicles = async () => {
    try {
      const response = await charterVehicleService.getAvailableCharterVehicles();
      if (response.success && response.availableVehicles) {
        setAvailableVehicles(response.availableVehicles);
      }
    } catch (error: any) {
      console.error('Error fetching available vehicles:', error);
      toast.error('Failed to load available vehicles');
    }
  };

  const handleStatusChange = async (driverId: string, newStatus: 'active' | 'inactive') => {
    try {
      const response = await charterDriverService.updateCharterDriverStatus(driverId, newStatus);
      if (response.success) {
        toast.success(`Driver ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        fetchDrivers();
      } else {
        toast.error(response.message || 'Failed to update driver status');
      }
    } catch (error: any) {
      console.error('Error updating driver status:', error);
      toast.error(error.message || 'Failed to update driver status');
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    try {
      const response = await charterDriverService.deleteCharterDriver(driverId);
      if (response.success) {
        toast.success('Driver deleted successfully');
        fetchDrivers();
      } else {
        toast.error(response.message || 'Failed to delete driver');
      }
    } catch (error: any) {
      console.error('Error deleting driver:', error);
      toast.error(error.message || 'Failed to delete driver');
    }
  };

  // Vehicle Assignment Functions
  const handleAssignVehicleClick = (driver: DriverData) => {
    if (driver.vehicle || driver.vehicleId) {
      toast.error('Driver already has a vehicle assigned');
      return;
    }

    if (availableVehicles.length === 0) {
      toast.error('No available vehicles. Please add vehicles first.');
      return;
    }

    setAssigningDriver(driver);
    assignForm.resetFields();
    setAssignModalVisible(true);
  };

  const handleAssignVehicleSubmit = async () => {
    try {
      const values = await assignForm.validateFields();
      
      if (!assigningDriver) return;

      setVehicleLoading(true);
      const response = await charterVehicleService.assignCharterVehicleToDriver({
        driverId: assigningDriver.driverId,
        vehicleId: values.vehicleId,
      });
      
      if (response.success) {
        toast.success('Vehicle assigned successfully');
        setAssignModalVisible(false);
        fetchDrivers();
        fetchAvailableVehicles();
      } else {
        toast.error(response.message || 'Failed to assign vehicle');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign vehicle');
    } finally {
      setVehicleLoading(false);
    }
  };

  const handleUnassignConfirm = async (driver: DriverData) => {
    try {
      const response = await charterVehicleService.unassignCharterVehicleFromDriver(driver.driverId);
      if (response.success) {
        toast.success('Vehicle unassigned successfully');
        fetchDrivers();
        fetchAvailableVehicles();
      } else {
        toast.error(response.message || 'Failed to unassign vehicle');
      }
    } catch (error: any) {
      console.error('Unassign error:', error);
      toast.error(error.message || 'Failed to unassign vehicle');
    }
  };
  
  const handleViewDetails = (driver: DriverData) => {
    // Transform DriverData to CharterDriverDetail format
    const transformedDriver: CharterDriverDetail = {
      _id: driver.driverId,
      userId: {
        _id: driver.userId,
        fullname: driver.name,
        email: driver.email,
        phone: driver.phone,
        isActive: driver.userStatus === 'active',
        role: driver.role as 'driver',
        createdAt: driver.createdAt,
      },
      licenseNumber: driver.licenseNumber || '',
      address: driver.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Nigeria',
      },
      vehicleId: driver.vehicle,
      totalTrips: driver.totalTrips,
      isVerified: driver.isVerified,
      status: driver.status,
      experience: driver.experience || 0,
      specialLicenses: driver.specialLicenses || [],
      languages: driver.languages || [],
      emergencyContact: driver.emergencyContact,
      assignedCharters: [],
      createdAt: driver.createdAt,
      updatedAt: driver.updatedAt,
    };
    
    setSelectedDriver(transformedDriver);
    setViewModalVisible(true);
  };
  
  const filteredDrivers = drivers?.filter(driver => {
    if (!driver) return false;
    
    const driverName = driver.name || '';
    const driverEmail = driver.email || '';
    const licenseNumber = driver.licenseNumber || '';
    const licensePlate = driver.vehicle?.licensePlate || '';
    const languages = driver.languages?.join(' ') || '';
    
    const matchesSearch = 
      driverName.toLowerCase().includes(searchText.toLowerCase()) ||
      driverEmail.toLowerCase().includes(searchText.toLowerCase()) ||
      licenseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      licensePlate.toLowerCase().includes(searchText.toLowerCase()) ||
      languages.toLowerCase().includes(searchText.toLowerCase());
  
    const driverStatus = driver.status || 'pending';
    const matchesStatus = statusFilter === 'all' || driverStatus === statusFilter;
  
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'Driver',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DriverData) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <UserOutlined className="text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
            <div className="text-xs text-gray-400">{record.phone}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'License No.',
      dataIndex: 'licenseNumber',
      key: 'licenseNumber',
      width: 150,
      render: (licenseNumber: string) => (
        <div>
          {licenseNumber ? (
            licenseNumber
          ) : (
            <Tag color="orange">Not Provided</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
          active: { color: 'green', text: 'Active' },
          inactive: { color: 'red', text: 'Inactive' },
          pending: { color: 'orange', text: 'Pending' },
          suspended: { color: 'gray', text: 'Suspended' },
        };
        
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Vehicle',
      key: 'vehicle',
      width: 280,
      render: (record: DriverData) => {
        if (record.vehicle || record.vehicleId) {
          const vehicleData = record.vehicle || (typeof record.vehicleId === 'object' ? record.vehicleId : null);
          return (
            <div className="flex items-center justify-between">
              <Tooltip title={`${vehicleData?.make} ${vehicleData?.model} (${vehicleData?.year}) - ${vehicleData?.capacity} seats`}>
                <div className="flex items-center">
                  <CarOutlined className="text-green-600 mr-2" />
                  <div>
                    <div className="font-medium text-sm">
                      {vehicleData?.make} {vehicleData?.model}
                    </div>
                    <div className="text-xs text-gray-500">
                      {vehicleData?.licensePlate} • {vehicleData?.vehicleType} • {vehicleData?.color}
                    </div>
                    <div className="text-xs text-gray-400">
                      Capacity: {vehicleData?.capacity} seats
                    </div>
                  </div>
                </div>
              </Tooltip>
              
              <Popconfirm
                title="Unassign Vehicle"
                description={`Are you sure you want to unassign the vehicle from ${record.name}?`}
                onConfirm={() => handleUnassignConfirm(record)}
                okText="Yes, Unassign"
                cancelText="No"
                okType="danger"
              >
                <Button
                  type="link"
                  danger
                  size="small"
                  onClick={(e) => e.stopPropagation()}
                >
                  Unassign
                </Button>
              </Popconfirm>
            </div>
          );
        } else {
          return (
            <div className="flex items-center justify-between">
              <Tag color="default">No Vehicle</Tag>
              <Button
                type="link"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAssignVehicleClick(record);
                }}
              >
                Assign Vehicle
              </Button>
            </div>
          );
        }
      },
    },
    {
      title: 'Experience',
      dataIndex: 'experience',
      key: 'experience',
      width: 100,
      render: (exp: number) => (
        <Tag color="purple">{exp || 0} years</Tag>
      ),
    },
    {
      title: 'Languages',
      dataIndex: 'languages',
      key: 'languages',
      width: 150,
      render: (languages: string[]) => (
        <div>
          {languages && languages.length > 0 ? (
            languages.slice(0, 2).map((lang, idx) => (
              <Tag key={idx} color="cyan" className="mb-1">
                {lang}
              </Tag>
            ))
          ) : (
            <Text type="secondary">-</Text>
          )}
          {languages && languages.length > 2 && (
            <Tag color="cyan">+{languages.length - 2}</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Trips',
      dataIndex: 'totalTrips',
      key: 'totalTrips',
      width: 80,
      render: (trips: number) => (
        <div className="text-center">
          <div className="font-medium">{trips || 0}</div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (record: DriverData) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          
          {record.status === 'active' ? (
            <Popconfirm
              title="Deactivate this driver?"
              description="Are you sure you want to deactivate this driver?"
              onConfirm={() => handleStatusChange(record.driverId, 'inactive')}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Deactivate Driver">
                <Button type="text" icon={<CloseCircleOutlined />} danger />
              </Tooltip>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Activate this driver?"
              description="Are you sure you want to activate this driver?"
              onConfirm={() => handleStatusChange(record.driverId, 'active')}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Activate Driver">
                <Button type="text" icon={<CheckCircleOutlined />} className="text-green-600" />
              </Tooltip>
            </Popconfirm>
          )}

          <Popconfirm
            title="Delete this driver?"
            description="This action cannot be undone. Are you sure?"
            onConfirm={() => handleDeleteDriver(record.driverId)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Stats
  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter(d => d.status === 'active').length;
  const inactiveDrivers = drivers.filter(d => d.status === 'inactive' || d.status === 'suspended').length;
  const pendingDrivers = drivers.filter(d => d.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
            <div className="text-center sm:text-left">
              <Title level={2} className="text-gray-800 mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl">
                Charter Drivers Management
              </Title>
              <Text className="text-gray-600 text-sm sm:text-base">
                Manage charter drivers, their qualifications, and vehicle assignments
              </Text>
            </div>
            <div className="flex flex-col xs:flex-row gap-2 justify-center sm:justify-start">
              <Link to="/admin/charter/add-driver" className="w-full xs:w-auto">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  size="large"
                  className="w-full xs:w-auto flex items-center justify-center"
                >
                  <span className="hidden sm:inline">Add New Charter Driver</span>
                  <span className="sm:hidden">Add Driver</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="shadow-sm">
            <div className="flex items-center p-2 sm:p-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-blue-100 flex items-center justify-center mr-2 sm:mr-3 md:mr-4">
                <UserOutlined className="text-blue-600 text-sm sm:text-base md:text-xl" />
              </div>
              <div className="min-w-0">
                <Text className="text-gray-500 text-xs sm:text-sm truncate">Total Drivers</Text>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate">
                  {totalDrivers}
                </div>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center p-2 sm:p-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-green-100 flex items-center justify-center mr-2 sm:mr-3 md:mr-4">
                <CheckCircleOutlined className="text-green-600 text-sm sm:text-base md:text-xl" />
              </div>
              <div className="min-w-0">
                <Text className="text-gray-500 text-xs sm:text-sm truncate">Active</Text>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate">
                  {activeDrivers}
                </div>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center p-2 sm:p-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-orange-100 flex items-center justify-center mr-2 sm:mr-3 md:mr-4">
                <CiCircleInfo className="text-orange-600 text-sm sm:text-base md:text-xl" />
              </div>
              <div className="min-w-0">
                <Text className="text-gray-500 text-xs sm:text-sm truncate">Pending</Text>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate">
                  {pendingDrivers}
                </div>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center p-2 sm:p-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-red-100 flex items-center justify-center mr-2 sm:mr-3 md:mr-4">
                <CloseCircleOutlined className="text-red-600 text-sm sm:text-base md:text-xl" />
              </div>
              <div className="min-w-0">
                <Text className="text-gray-500 text-xs sm:text-sm truncate">Inactive</Text>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate">
                  {inactiveDrivers}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Search
                placeholder="Search drivers by name, email, license, vehicle plate, or languages..."
                prefix={<SearchOutlined />}
                size="large"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </div>
            
            <Select
              placeholder="Filter by status"
              size="large"
              style={{ width: 200 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="pending">Pending</Option>
              <Option value="suspended">Suspended</Option>
            </Select>
          </div>
        </Card>
    
        {/* Drivers Table */}
        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={filteredDrivers.map(driver => ({
              ...driver,
              key: driver._id,
            }))}
            rowKey="_id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} drivers`,
            }}
            scroll={{ x: 1500 }}
          />
        </Card>

        {/* Vehicle Assignment Modal */}
        <Modal
          title="Assign Vehicle to Charter Driver"
          open={assignModalVisible}
          onOk={handleAssignVehicleSubmit}
          onCancel={() => setAssignModalVisible(false)}
          confirmLoading={vehicleLoading}
          width={600}
        >
          {assigningDriver && (
            <Form form={assignForm} layout="vertical">
              <Form.Item label="Driver">
                <div className="p-2 border rounded bg-gray-50">
                  <div className="flex items-center">
                    <UserOutlined className="text-blue-600 mr-2" />
                    <div>
                      <div className="font-medium">{assigningDriver.name}</div>
                      <div className="text-sm text-gray-500">{assigningDriver.email}</div>
                      {assigningDriver.experience ? (
                        <div className="text-xs text-gray-400">{assigningDriver.experience} years experience</div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Form.Item>
              
              <Form.Item
                name="vehicleId"
                label="Select Vehicle"
                rules={[{ required: true, message: 'Please select a vehicle' }]}
              >
                <Select 
                  placeholder="Select a vehicle to assign"
                  size="large"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const label = typeof option?.children === 'string' 
                      ? option.children 
                      : String(option?.children || '');
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {availableVehicles.map(vehicle => (
                    <Option key={vehicle._id} value={vehicle._id}>
                      {`${vehicle.make} ${vehicle.model} (${vehicle.year}) - ${vehicle.licensePlate} • ${vehicle.capacity} seats • ${vehicle.color}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {availableVehicles.length === 0 && (
                <div className="p-4 border border-yellow-200 bg-yellow-50 rounded">
                  <div className="flex items-center">
                    <ExclamationCircleOutlined className="text-yellow-600 mr-2" />
                    <div>
                      <div className="font-medium text-yellow-800">No available vehicles</div>
                      <div className="text-sm text-yellow-700">
                        Please add vehicles first through the "Add Vehicle" option.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-50 rounded">
                <div className="text-sm text-blue-700">
                  <strong>Note:</strong> Once assigned, this vehicle will be marked as "assigned" 
                  and won't be available for other drivers until unassigned.
                </div>
              </div>
            </Form>
          )}
        </Modal>

        {/* Driver Details Modal */}
        <CharterDriverDetailsModal
          selectedDriver={selectedDriver}
          visible={viewModalVisible}
          onClose={() => setViewModalVisible(false)}
        />
      </div>
    </div>
  );
};

export default CharterDriverList;