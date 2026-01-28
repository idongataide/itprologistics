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
import { Link } from 'react-router-dom';
import { DriverDetail, DriverSummaryStats } from '@/types';

interface VehicleData {
  _id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
}
import driverService from '@/services/admin/driverService';
import driverVehicleService from '@/services/admin/driverVehicle';
import DriverDetailsModal from './DriverDetailsModal';
import toast from 'react-hot-toast';


const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

interface DriverWithIncompleteDetails extends Omit<DriverDetail, 'userId'> {
  _id: string;
  userId: string;
  hasDriverDetails: boolean;
  name: string;
  email: string;
  phone: string;
  driverStatus?: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    vehicleType: string;
  };
}

const DriverList: React.FC = () => {
  const [drivers, setDrivers] = useState<DriverWithIncompleteDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [selectedDriver, setSelectedDriver] = useState<DriverWithIncompleteDetails | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  
  // Vehicle Assignment States
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState<VehicleData[]>([]);
  const [assigningDriver, setAssigningDriver] = useState<DriverWithIncompleteDetails | null>(null);
  const [assignForm] = Form.useForm();
  const [vehicleLoading, setVehicleLoading] = useState(false);

  useEffect(() => {
    fetchDrivers();
    fetchAvailableVehicles();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const data = await driverService.getDrivers();
      if (data.success) {
        const transformedDrivers = data.drivers.map((driver: any) => ({
          ...driver,
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          userId: driver.userId ? driver.userId : { 
            _id: driver.id || driver.userId,
            name: driver.name,
            email: driver.email,
            phone: driver.phone 
          },
          hasDriverDetails: driver.hasDriverDetails || driver.driverId !== undefined,
          _id: driver.driverId || driver.id || driver.userId,
          status: driver.driverStatus || driver.status,
        }));
        setDrivers(transformedDrivers);
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
      const data = await driverVehicleService.getAvailableVehicles();
      if (data.success && data.availableVehicles) {
        setAvailableVehicles(data.availableVehicles);
      }
    } catch (error: any) {
      console.error('Error fetching available vehicles:', error);
      toast.error('Failed to load available vehicles');
    }
  };

  const handleStatusChange = async (driverId: string, newStatus: 'active' | 'suspended') => {
    try {
      const driver = drivers.find(d => d._id === driverId || d.userId === driverId);
      if (!driver) return;

      const idToUse = driver.hasDriverDetails ? driver._id : driver.userId;
      
      const data = await driverService.updateDriverStatus(idToUse, newStatus);
      if (data.success) {
        toast.success(`Driver ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
        fetchDrivers();
      }
    } catch (error: any) {
      console.error('Error updating driver status:', error);
      toast.error(error.message || 'Failed to update driver status');
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    try {
      const driver = drivers.find(d => d._id === driverId || d.userId === driverId);
      if (!driver) return;

      const idToUse = driver.hasDriverDetails ? driver._id : driver._id;    
      const data = await driverService.deleteDriver(idToUse);
      if (data.success) {
        toast.success('Driver deleted successfully');
        fetchDrivers();
      }
    } catch (error: any) {
      console.error('Error deleting driver:', error);
      toast.error(error.message || 'Failed to delete driver');
    }
  };



  const handleCompleteDriverDetails = (driver: DriverWithIncompleteDetails) => {
    window.location.href = `/admin/drivers/${driver?._id}/add-details`;
  };

  // Vehicle Assignment Functions
  const handleAssignVehicleClick = (driver: DriverWithIncompleteDetails) => {
    console.log(availableVehicles, 'hhhhh')
    if (!driver.hasDriverDetails) {
      toast.error('Please complete driver details first before assigning a vehicle');
      return;
    }

    if (driver.vehicleId) {
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
      const data = await driverVehicleService.assignVehicleToDriver({
        driverId: assigningDriver._id,
        vehicleId: values.vehicleId,
      });
      
      if (data.success) {
        toast.success('Vehicle assigned successfully');
        setAssignModalVisible(false);
        fetchDrivers();
        fetchAvailableVehicles();
      } else {
        toast.error(data.message || 'Failed to assign vehicle');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign vehicle');
    } finally {
      setVehicleLoading(false);
    }
  };
  const handleUnassignConfirm = async (driver: DriverWithIncompleteDetails) => {
    
    try {
      const data = await driverVehicleService.unassignVehicleFromDriver(driver.userId);
      if (data.success) {
        toast.success('Vehicle unassigned successfully');
        fetchDrivers();
        fetchAvailableVehicles();
      } else {
        toast.error(data.message || 'Failed to unassign vehicle');
      }
    } catch (error: any) {
      console.error('Unassign error:', error);
      toast.error(error.message || 'Failed to unassign vehicle');
    }
  };
  
  const filteredDrivers = drivers?.filter(driver => {
    if (!driver) return false;
    
    const driverName = driver.name || '';
    const driverEmail = driver.email || '';
    const licenseNumber = driver.licenseNumber || '';
    const licensePlate = driver.vehicle?.licensePlate || driver.vehicleId?.licensePlate || '';
    
    const matchesSearch = 
      driverName.toLowerCase().includes(searchText.toLowerCase()) ||
      driverEmail.toLowerCase().includes(searchText.toLowerCase()) ||
      licenseNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      licensePlate.toLowerCase().includes(searchText.toLowerCase());
  
    const driverStatus = driver.status || driver.driverStatus || 'pending';
    const matchesStatus = statusFilter === 'all' || driverStatus === statusFilter;
    
    const matchesVerification = verificationFilter === 'all' || 
      (verificationFilter === 'verified' && driver.isVerified) ||
      (verificationFilter === 'unverified' && !driver.isVerified) ||
      (verificationFilter === 'complete' && driver.hasDriverDetails) ||
      (verificationFilter === 'incomplete' && !driver.hasDriverDetails);
  
    return matchesSearch && matchesStatus && matchesVerification;
  });

  const columns = [
    {
      title: 'Driver',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DriverWithIncompleteDetails) => (
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
            <Tag color="orange">Required</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'driverStatus',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
          active: { color: 'green', text: 'Active' },
          pending: { color: 'orange', text: 'Pending' },
          suspended: { color: 'red', text: 'Suspended' },
          inactive: { color: 'gray', text: 'Inactive' },
        };
        
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Vehicle',
      key: 'vehicle',
      width: 220,
      render: (record: DriverWithIncompleteDetails) => {
        if (!record.hasDriverDetails) {
          return <Tag color="orange">Details Required</Tag>;
        }
        
        if (record.vehicle || record.vehicleId) {
          const vehicleData = record.vehicle || (typeof record.vehicleId === 'object' ? record.vehicleId : null);
          return (
            <div className="flex items-center justify-between">
              <Tooltip title={`${vehicleData?.make} ${vehicleData?.model} (${vehicleData?.year})`}>
                <div className="flex items-center">
                  <CarOutlined className="text-green-600 mr-2" />
                  <div>
                    <div className="font-medium text-sm">
                      {vehicleData?.make}-{vehicleData?.model}
                    </div>
                    <div className="text-xs text-gray-500">
                      {vehicleData?.licensePlate} - {vehicleData?.vehicleType}
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
      title: 'Trips',
      dataIndex: 'totalTrips',
      key: 'totalTrips',
      width: 100,
      render: (trips: number) => (
        <div className="text-center">
          <div className="font-medium">{trips || 0}</div>
          <div className="text-xs text-gray-500">trips</div>
        </div>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'driverRating',
      key: 'driverRating',
      width: 120,
      render: (rating: number) => (
        <div className="flex items-center">
          <span className="text-yellow-500 mr-1">★</span>
          <span className="font-medium">{rating?.toFixed(1) || '0.0'}</span>
          <span className="text-gray-500 text-xs ml-1">/5</span>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 250,
      render: (record: DriverWithIncompleteDetails) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedDriver(record);
                setViewModalVisible(true);
              }}
            />
          </Tooltip>
          
          {!record.hasDriverDetails ? (
            <Tooltip title="Complete Driver Details">
              <Button
                type="primary"
                size="small"
                onClick={() => handleCompleteDriverDetails(record)}
              >
                Complete Details
              </Button>
            </Tooltip>
          ) : (
            <>
              {record.status === 'active' ? (
                <Popconfirm
                  title="Suspend this driver?"
                  description="Are you sure you want to suspend this driver?"
                  onConfirm={() => handleStatusChange(record._id!, 'suspended')}
                  okText="Yes"
                  cancelText="No"
                >
                  <Tooltip title="Suspend Driver">
                    <Button type="text" icon={<CloseCircleOutlined />} />
                  </Tooltip>
                </Popconfirm>
              ) : (
                <Popconfirm
                  title="Activate this driver?"
                  description="Are you sure you want to activate this driver?"
                  onConfirm={() => handleStatusChange(record._id!, 'active')}
                  okText="Yes"
                  cancelText="No"
                >
                  <Tooltip title="Activate Driver">
                    <Button type="text" icon={<CheckCircleOutlined />} />
                  </Tooltip>
                </Popconfirm>
              )}
            </>
          )}

          <Popconfirm
            title="Delete this driver?"
            description="This action cannot be undone. Are you sure?"
            onConfirm={() => handleDeleteDriver(record._id!)}
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

  const summaryStats: DriverSummaryStats = {
    totalDrivers: drivers.length,
    activeDrivers: drivers.filter(d => d.status === 'active').length,
    pendingDrivers: drivers.filter(d => d.status === 'pending').length,
    verifiedDrivers: drivers.filter(d => d.isVerified).length,
    driversWithVehicles: drivers.filter(d => d.vehicleId).length,
  };

  const driversWithCompleteDetails = drivers.filter(d => d.hasDriverDetails).length;
  const driversWithVehicles = drivers.filter(d => d.vehicleId).length;
  const availableVehiclesCount = availableVehicles.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
            <div className="text-center sm:text-left">
              <Title level={2} className="text-gray-800 mb-1 sm:mb-2 text-xl sm:text-2xl lg:text-3xl">
                Drivers Management
              </Title>
              <Text className="text-gray-600 text-sm sm:text-base">
                Manage all drivers and their assigned vehicles
              </Text>
            </div>
            <div className="flex flex-col xs:flex-row gap-2 justify-center sm:justify-start">
              <Link to="/admin/drivers/add" className="w-full xs:w-auto">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  size="large"
                  className="w-full xs:w-auto flex items-center justify-center"
                >
                  <span className="hidden sm:inline">Add New Driver</span>
                  <span className="sm:hidden">Add Driver</span>
                </Button>
              </Link>
              <Link to="/admin/vehicles" className="w-full xs:w-auto">
                <Button 
                  icon={<CarOutlined />} 
                  size="large"
                  className="w-full xs:w-auto flex items-center justify-center"
                >
                  <span className="hidden sm:inline">Manage Vehicles</span>
                  <span className="sm:hidden">Vehicles</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <Card className="shadow-sm">
            <div className="flex items-center p-2 sm:p-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-blue-100 flex items-center justify-center mr-2 sm:mr-3 md:mr-4">
                <UserOutlined className="text-blue-600 text-sm sm:text-base md:text-xl" />
              </div>
              <div className="min-w-0">
                <Text className="text-gray-500 text-xs sm:text-sm truncate">Total Drivers</Text>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate">
                  {summaryStats.totalDrivers}
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
                  {summaryStats.activeDrivers}
                </div>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center p-2 sm:p-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-purple-100 flex items-center justify-center mr-2 sm:mr-3 md:mr-4">
                <CheckCircleOutlined className="text-purple-600 text-sm sm:text-base md:text-xl" />
              </div>
              <div className="min-w-0">
                <Text className="text-gray-500 text-xs sm:text-sm truncate">Verified</Text>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate">
                  {summaryStats.verifiedDrivers}
                </div>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center p-2 sm:p-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-2 sm:mr-3 md:mr-4">
                <CarOutlined className="text-indigo-600 text-sm sm:text-base md:text-xl" />
              </div>
              <div className="min-w-0">
                <Text className="text-gray-500 text-xs sm:text-sm truncate">With Vehicles</Text>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate">
                  {driversWithVehicles}
                </div>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center p-2 sm:p-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-emerald-100 flex items-center justify-center mr-2 sm:mr-3 md:mr-4">
                <CarOutlined className="text-emerald-600 text-sm sm:text-base md:text-xl" />
              </div>
              <div className="min-w-0">
                <Text className="text-gray-500 text-xs sm:text-sm truncate">Available Vehicles</Text>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate">
                  {availableVehiclesCount}
                </div>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center p-2 sm:p-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-red-100 flex items-center justify-center mr-2 sm:mr-3 md:mr-4">
                <ExclamationCircleOutlined className="text-red-600 text-sm sm:text-base md:text-xl" />
              </div>
              <div className="min-w-0">
                <Text className="text-gray-500 text-xs sm:text-sm truncate">Incomplete</Text>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate">
                  {drivers.length - driversWithCompleteDetails}
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
                placeholder="Search drivers by name, email, license or vehicle plate..."
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
              <Option value="pending">Pending</Option>
              <Option value="suspended">Suspended</Option>
              <Option value="inactive">Inactive</Option>
            </Select>

            <Select
              placeholder="Filter by details"
              size="large"
              style={{ width: 200 }}
              value={verificationFilter}
              onChange={setVerificationFilter}
            >
              <Option value="all">All Drivers</Option>
              <Option value="complete">Complete Details</Option>
              <Option value="incomplete">Incomplete Details</Option>
            </Select>
          </div>
        </Card>
    
        {/* Drivers Table */}
        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={filteredDrivers.map(driver => ({
              ...driver,
              key: driver._id || driver.userId,
            }))}
            rowKey={record => record._id || record.userId}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} drivers`,
            }}
            scroll={{ x: 1300 }}
          />
        </Card>

    
    {/* Vehicle Assignment Modal */}
    <Modal
      title="Assign Vehicle to Driver"
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
                  {`${vehicle.make} ${vehicle.model} - ${vehicle.licensePlate} (${vehicle.color})`}
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
                    Please add vehicles first or check if existing vehicles are in maintenance.
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
        <DriverDetailsModal
          selectedDriver={
            selectedDriver
              ? {
                  ...selectedDriver,
                  userId: typeof selectedDriver.userId === 'string'
                    ? {
                        _id: selectedDriver.userId,
                        name: selectedDriver.name,
                        email: selectedDriver.email,
                        phone: selectedDriver.phone,
                        // Provide default or fallback values for missing fields
                        role: (selectedDriver as any).role || 'driver',
                        status: (selectedDriver as any).status || 'active'
                      }
                    : selectedDriver.userId
                }
              : null
          }
          visible={viewModalVisible}
          onClose={() => setViewModalVisible(false)}
        />
      </div>
    </div>
  );
};

export default DriverList;