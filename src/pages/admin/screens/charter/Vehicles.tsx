// components/CharterVehicleList.tsx
import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Tag,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Upload,
  Image,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CarOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import charterVehicleService, { 
  CreateCharterVehicleData, 
  UpdateCharterVehicleData,
} from '@/services/admin/charter/charterVehicleService';
import toast from 'react-hot-toast';

const { Option } = Select;

interface VehicleData {
  _id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  vehicleType: string;
  capacity: number;
  thumbnail?: string;
  status: 'available' | 'assigned' | 'maintenance' | 'inactive';
  features?: string[];
  fuelType?: string;
  createdAt?: string;
}

const CharterVehicleList: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleData | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await charterVehicleService.getCharterVehicles();
      if (response.success && response.vehicles) {
        setVehicles(response.vehicles);
      } else {
        toast.error('Failed to fetch vehicles');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    form.resetFields();
    setFileList([]);
    setModalVisible(true);
  };

  const handleEditVehicle = (vehicle: VehicleData) => {
    setEditingVehicle(vehicle);
    form.setFieldsValue({
      ...vehicle,
      features: vehicle.features ? vehicle.features.join(', ') : '',
    });
    
    // If vehicle has thumbnail, set it in fileList
    if (vehicle.thumbnail) {
      setFileList([
        {
          uid: '-1',
          name: 'thumbnail.png',
          status: 'done',
          url: vehicle.thumbnail,
        },
      ]);
    } else {
      setFileList([]);
    }
    
    setModalVisible(true);
  };

  const handleDeleteVehicle = async (id: string) => {
    try {
      const response = await charterVehicleService.deleteCharterVehicle(id);
      if (response.success) {
        toast.success('Vehicle deleted successfully');
        fetchVehicles();
      } else {
        toast.error(response.message || 'Failed to delete vehicle');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete vehicle');
    }
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Process features if they exist
      let features: string[] = [];
      if (values.features) {
        features = typeof values.features === 'string' 
          ? values.features.split(',').map((f: string) => f.trim()).filter(Boolean)
          : values.features;
      }
      
      if (editingVehicle) {
        // Update existing vehicle
        const updateData: UpdateCharterVehicleData = {
          make: values.make,
          model: values.model,
          year: values.year,
          licensePlate: values.licensePlate,
          color: values.color,
          vehicleType: values.vehicleType,
          capacity: values.capacity,
          status: values.status,
          fuelType: values.fuelType,
          features: features,
        };
        
        // Add thumbnail if new one is selected
        if (fileList.length > 0 && fileList[0].originFileObj) {
          updateData.thumbnail = fileList[0].originFileObj as File;
        }
        
        const response = await charterVehicleService.updateCharterVehicle(editingVehicle._id, updateData);
        if (response.success) {
          toast.success('Vehicle updated successfully');
          setModalVisible(false);
          fetchVehicles();
        } else {
          toast.error(response.message || 'Failed to update vehicle');
        }
      } else {
        // Create new vehicle
        const createData: CreateCharterVehicleData = {
          make: values.make,
          model: values.model,
          year: values.year,
          licensePlate: values.licensePlate,
          color: values.color,
          vehicleType: values.vehicleType,
          capacity: values.capacity,
          fuelType: values.fuelType,
          features: features,
        };
        
        // Add thumbnail if selected
        if (fileList.length > 0 && fileList[0].originFileObj) {
          createData.thumbnail = fileList[0].originFileObj as File;
        }
        
        const response = await charterVehicleService.createCharterVehicle(createData);
        if (response.success) {
          toast.success('Vehicle created successfully');
          setModalVisible(false);
          fetchVehicles();
        } else {
          toast.error(response.message || 'Failed to create vehicle');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save vehicle');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setFileList([]);
  };

  const uploadProps: UploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      // Validate file type
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        toast.error('You can only upload image files!');
        return Upload.LIST_IGNORE;
      }

      // Validate file size (max 2MB)
      const isLessThan2MB = file.size / 1024 / 1024 < 2;
      if (!isLessThan2MB) {
        toast.error('Image must be smaller than 2MB!');
        return Upload.LIST_IGNORE;
      }

      setFileList([file]);
      return false; // Prevent auto upload
    },
    fileList,
    maxCount: 1,
    listType: 'picture-card',
    accept: 'image/*',
  };

  const columns: ColumnsType<VehicleData> = [
    {
      title: 'Thumbnail',
      key: 'thumbnail',
      width: 80,
      render: (_, record) => (
        record.thumbnail ? (
          <Image
            src={record.thumbnail}
            alt={`${record.make} ${record.model}`}
            width={50}
            height={50}
            className="rounded object-cover"
            preview={false}
          />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
            <CarOutlined className="text-gray-400" />
          </div>
        )
      ),
    },
    {
      title: 'License Plate',
      dataIndex: 'licensePlate',
      key: 'licensePlate',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Make',
      dataIndex: 'make',
      key: 'make',
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity: number) => (
        <Tag color="purple">{capacity} seats</Tag>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'vehicleType',
      key: 'vehicleType',
      render: (type: string) => (
        <Tag color="blue" className="capitalize">
          {type}
        </Tag>
      ),
    },
    {
      title: 'Fuel Type',
      dataIndex: 'fuelType',
      key: 'fuelType',
      render: (fuel: string) => fuel ? <Tag color="cyan">{fuel}</Tag> : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = status === 'available' ? 'green' : 
                   status === 'assigned' ? 'blue' : 
                   status === 'maintenance' ? 'orange' : 'red';
        return (
          <Tag color={color} key={status}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewVehicle(record)}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditVehicle(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Vehicle"
            description="Are you sure you want to delete this vehicle?"
            onConfirm={() => handleDeleteVehicle(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleViewVehicle = (vehicle: VehicleData) => {
    Modal.info({
      title: 'Vehicle Details',
      width: 800,
      content: (
        <div>
          <Row gutter={[16, 16]}>
            <Col span={24} className="flex justify-center mb-4">
              {vehicle.thumbnail ? (
                <Image
                  src={vehicle.thumbnail}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  width={300}
                  height={200}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="w-64 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <CarOutlined className="text-gray-400 text-4xl" />
                </div>
              )}
            </Col>
            <Col span={12}>
              <strong>License Plate:</strong> {vehicle.licensePlate}
            </Col>
            <Col span={12}>
              <strong>Make:</strong> {vehicle.make}
            </Col>
            <Col span={12}>
              <strong>Model:</strong> {vehicle.model}
            </Col>
            <Col span={12}>
              <strong>Year:</strong> {vehicle.year}
            </Col>
            <Col span={12}>
              <strong>Color:</strong> {vehicle.color}
            </Col>
            <Col span={12}>
              <strong>Capacity:</strong> {vehicle.capacity} passengers
            </Col>
            <Col span={12}>
              <strong>Fuel Type:</strong> {vehicle.fuelType || 'N/A'}
            </Col>
            <Col span={12}>
              <strong>Type:</strong> 
              <Tag color="blue" style={{ marginLeft: 8 }} className="capitalize">
                {vehicle.vehicleType}
              </Tag>
            </Col>
            <Col span={12}>
              <strong>Status:</strong> 
              <Tag color={vehicle.status === 'available' ? 'green' : 'blue'} style={{ marginLeft: 8 }}>
                {vehicle.status.toUpperCase()}
              </Tag>
            </Col>
            {vehicle.features && vehicle.features.length > 0 && (
              <Col span={24}>
                <strong>Features:</strong>
                <div className="mt-2">
                  {vehicle.features.map((feature, index) => (
                    <Tag key={index} color="geekblue" className="mb-1">
                      {feature.replace(/_/g, ' ')}
                    </Tag>
                  ))}
                </div>
              </Col>
            )}
            <Col span={12}>
              <strong>Created:</strong> {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : 'N/A'}
            </Col>
          </Row>
        </div>
      ),
    });
  };

  const vehicleStats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'available').length,
    assigned: vehicles.filter(v => v.status === 'assigned').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Total Vehicles"
                  value={vehicleStats.total}
                  prefix={<CarOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Available"
                  value={vehicleStats.available}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Assigned"
                  value={vehicleStats.assigned}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Maintenance"
                  value={vehicleStats.maintenance}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card
        title="Charter Vehicle Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddVehicle}
          >
            Add New Charter Vehicle
          </Button>
        }
        style={{ marginTop: 16 }}
      >
        <Table
          columns={columns}
          dataSource={vehicles}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title={editingVehicle ? 'Edit Charter Vehicle' : 'Add New Charter Vehicle'}
        open={modalVisible}
        onOk={handleModalSubmit}
        onCancel={handleModalCancel}
        width={800}
        okText={editingVehicle ? 'Update' : 'Create'}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          name="charterVehicleForm"
          initialValues={{
            vehicleType: 'car',
            status: 'available',
            capacity: 4,
          }}
        >
          <Form.Item
            label="Vehicle Thumbnail"
            required={false}
            tooltip="Upload a clear image of the vehicle (max 2MB)"
          >
            <Upload {...uploadProps}>
              {fileList.length === 0 && (
                <div className="flex flex-col items-center">
                  <UploadOutlined className="text-2xl" />
                  <div className="mt-2">Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="make"
                label="Make"
                rules={[{ required: true, message: 'Please enter vehicle make' }]}
              >
                <Input placeholder="e.g., Toyota" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="model"
                label="Model"
                rules={[{ required: true, message: 'Please enter vehicle model' }]}
              >
                <Input placeholder="e.g., Hiace" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="year"
                label="Year"
                rules={[{ required: true, message: 'Please enter vehicle year' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1900}
                  max={new Date().getFullYear() + 1}
                  placeholder="e.g., 2023"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="capacity"
                label="Passenger Capacity"
                rules={[{ required: true, message: 'Please enter capacity' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={100}
                  placeholder="e.g., 14"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="licensePlate"
                label="License Plate"
                rules={[{ required: true, message: 'Please enter license plate' }]}
              >
                <Input placeholder="e.g., ABC-123" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="color"
                label="Color"
                rules={[{ required: true, message: 'Please enter vehicle color' }]}
              >
                <Input placeholder="e.g., White" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="fuelType"
                label="Fuel Type"
              >
                <Select placeholder="Select fuel type" allowClear>
                  <Option value="petrol">Petrol</Option>
                  <Option value="diesel">Diesel</Option>
                  <Option value="electric">Electric</Option>
                  <Option value="hybrid">Hybrid</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="vehicleType"
                label="Vehicle Type"
                rules={[{ required: true, message: 'Please select vehicle type' }]}
              >
                <Select placeholder="Select vehicle type">
                  <Option value="sedan">Sedan</Option>
                  <Option value="suv">SUV</Option>
                  <Option value="van">Van</Option>
                  <Option value="bus">Bus</Option>
                  <Option value="minibus">Minibus</Option>
                  <Option value="luxury">Luxury</Option>
                  <Option value="sprinter">Sprinter</Option>
                  <Option value="coaster">Coaster</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="features"
            label="Features (comma separated)"
            tooltip="e.g., air_conditioning, wifi, usb_charging"
          >
            <Input placeholder="air_conditioning, wifi, usb_charging" />
          </Form.Item>

          {editingVehicle && (
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select>
                <Option value="available">Available</Option>
                <Option value="assigned">Assigned</Option>
                <Option value="maintenance">Maintenance</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default CharterVehicleList;