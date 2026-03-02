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
  Descriptions,
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
import { API_URL } from '@/services/config/api';

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
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<VehicleData | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  // Get a URL suitable for <img> sources.  convert any absolute API_URL
  // origins to a relative `/uploads` path so that the Vite dev server proxy
  // can forward the request and avoid CORS problems.  If the value is already
  // relative or points to another host we just return it verbatim.
  const getImageUrl = (path: string) => {
    if (!path) return '';

    // convert any hard‑coded localhost:5000 URLs (leftover from local testing)
    // into the current API host so they still resolve after deployment.
    const localhostRegex = /^https?:\/\/localhost:5000(\/.*)?$/i;
    if (localhostRegex.test(path)) {
      const rel = path.replace(localhostRegex, '$1');
      const prodBase = API_URL.replace(/\/api\/?$/i, '');
      return `${prodBase}${rel.startsWith('/') ? '' : '/'}${rel}`;
    }

    try {
      const url = new URL(path);
      const apiOrigin = new URL(API_URL).origin; // e.g. http://localhost:5000
      if (url.origin === apiOrigin) {
        return url.pathname + url.search + url.hash;
      }
      return path; // external host
    } catch {
      // not a full URL, treat as relative path
    }

    // if we reached here, `path` is relative (e.g. '/uploads/...').
    // in development we let the Vite proxy handle it; in production we
    // must prefix the API host so the browser requests the static file
    // from wherever the backend lives.
    const base = API_URL.replace(/\/api\/?$/i, '');
    if (process.env.NODE_ENV === 'production') {
      return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
    }
    return path;
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await charterVehicleService.getCharterVehicles();
      if (response.success && response.vehicles) {
        setVehicles(response.vehicles.map((v: VehicleData) => ({
          ...v,
          thumbnail: getImageUrl(v.thumbnail || ''),
        })));
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
          name: 'thumbnail.jpg',
          status: 'done',
          url: getImageUrl(vehicle.thumbnail),
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

  const handleViewVehicle = (vehicle: VehicleData) => {
    setSelectedVehicle(vehicle);
    setViewModalVisible(true);
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
        // Update existing vehicle using the typed service interface
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
          features,
        };

        if (fileList.length > 0) {
          const first: any = fileList[0];
          console.log('submit update, fileList[0]=', first);
          const fileObj: File | undefined =
            first.originFileObj instanceof File ? first.originFileObj :
            first instanceof File ? first :
            undefined;
          console.log('resolved fileObj', fileObj);
          if (fileObj) {
            updateData.thumbnail = fileObj;
          }
        }

        const response = await charterVehicleService.updateCharterVehicle(
          editingVehicle._id,
          updateData,
        );
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
          features,
        };

        if (fileList.length > 0) {
          const first: any = fileList[0];
          console.log('submit create, fileList[0]=', first);
          const fileObj: File | undefined =
            first.originFileObj instanceof File ? first.originFileObj :
            first instanceof File ? first :
            undefined;
          console.log('resolved fileObj', fileObj);
          if (fileObj) {
            createData.thumbnail = fileObj;
          }
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
    form.resetFields();
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

      // Create preview URL
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      return false; // Prevent auto upload
    },
    onChange: ({ fileList: newFileList }) => {
      // Update fileList state
      setFileList(newFileList);
    },
    fileList,
    maxCount: 1,
    listType: 'picture-card',
    accept: 'image/*',
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
  };

  // Custom image component with error handling
  const VehicleImage = ({ src, alt, width = 50, height = 50, className = "rounded object-cover" }: any) => {
    const [error, setError] = useState(false);
    const [imageSrc, setImageSrc] = useState(src ? getImageUrl(src) : '');

    useEffect(() => {
      setImageSrc(src ? getImageUrl(src) : '');
      setError(false);
    }, [src]);

    if (error || !imageSrc) {
      return (
        <div 
          className="bg-gray-100 rounded flex items-center justify-center"
          style={{ width, height }}
        >
          <CarOutlined className="text-gray-400" />
        </div>
      );
    }

    return (
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={() => setError(true)}
      />
    );
  };

  const columns: ColumnsType<VehicleData> = [
    {
      title: 'Thumbnail',
      key: 'thumbnail',
      width: 80,
      render: (_, record) => (
        <VehicleImage 
          src={record.thumbnail}
          alt={`${record.make} ${record.model}`}
          width={50}
          height={50}
        />
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

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Total Vehicles"
                  value={vehicles.length}
                  prefix={<CarOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Available"
                  value={vehicles.filter(v => v.status === 'available').length}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Assigned"
                  value={vehicles.filter(v => v.status === 'assigned').length}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Maintenance"
                  value={vehicles.filter(v => v.status === 'maintenance').length}
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

      {/* Add/Edit Modal */}
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
            vehicleType: 'sedan',
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
                <Input 
                  placeholder="e.g., ABC-123" 
                  style={{ textTransform: 'uppercase' }}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                  }}
                />
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
                  <Option value="coaster">Coaster</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="features"
            label="Features (comma separated)"
            tooltip="e.g., air conditioning, wifi, usb charging"
          >
            <Input placeholder="air conditioning, wifi, usb charging" />
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

      {/* View Modal */}
      <Modal
        title="Vehicle Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedVehicle && (
          <div className="py-4">
            <Row gutter={[16, 16]}>
              <Col span={24} className="flex justify-center mb-4">
                <VehicleImage 
                  src={selectedVehicle.thumbnail}
                  alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                  width={300}
                  height={200}
                  className="rounded-lg object-cover"
                />
              </Col>
              
              <Col span={24}>
                <Descriptions bordered column={2} size="middle">
                  <Descriptions.Item label="License Plate" span={1}>
                    <strong>{selectedVehicle.licensePlate}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status" span={1}>
                    <Tag color={
                      selectedVehicle.status === 'available' ? 'green' : 
                      selectedVehicle.status === 'assigned' ? 'blue' : 
                      selectedVehicle.status === 'maintenance' ? 'orange' : 'red'
                    }>
                      {selectedVehicle.status.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Make" span={1}>
                    {selectedVehicle.make}
                  </Descriptions.Item>
                  <Descriptions.Item label="Model" span={1}>
                    {selectedVehicle.model}
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Year" span={1}>
                    {selectedVehicle.year}
                  </Descriptions.Item>
                  <Descriptions.Item label="Color" span={1}>
                    <span style={{ color: selectedVehicle.color.toLowerCase() }}>
                      {selectedVehicle.color}
                    </span>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Vehicle Type" span={1}>
                    <Tag color="blue" className="capitalize">
                      {selectedVehicle.vehicleType}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Capacity" span={1}>
                    <Tag color="purple">{selectedVehicle.capacity} passengers</Tag>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Fuel Type" span={1}>
                    {selectedVehicle.fuelType ? (
                      <Tag color="cyan">{selectedVehicle.fuelType}</Tag>
                    ) : 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Created Date" span={1}>
                    {selectedVehicle.createdAt ? 
                      new Date(selectedVehicle.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'
                    }
                  </Descriptions.Item>
                </Descriptions>
              </Col>

              {selectedVehicle.features && selectedVehicle.features.length > 0 && (
                <Col span={24}>
                  <div className="mt-4">
                    <h4 className="text-gray-700 font-medium mb-2">Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedVehicle.features.map((feature, index) => (
                        <Tag key={index} color="geekblue" className="mb-1">
                          {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CharterVehicleList;