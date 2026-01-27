// components/VehicleManagement.tsx
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
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { VehicleData, createVehicle, getVehicles, updateVehicle, deleteVehicle } from '@/services/admin/Vehicle';

const { Option } = Select;

const VehicleList: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleData | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await getVehicles();
      if (response.success && response.vehicles) {
        setVehicles(response.vehicles);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditVehicle = (vehicle: VehicleData) => {
    setEditingVehicle(vehicle);
    form.setFieldsValue(vehicle);
    setModalVisible(true);
  };

  const handleDeleteVehicle = async (id: string) => {
    try {
      const response = await deleteVehicle(id);
      if (response.success) {
        message.success('Vehicle deleted successfully');
        fetchVehicles();
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to delete vehicle');
    }
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingVehicle) {
        // Update existing vehicle
        const response = await updateVehicle(editingVehicle._id!, values);
        if (response.success) {
          message.success('Vehicle updated successfully');
          setModalVisible(false);
          fetchVehicles();
        }
      } else {
        // Create new vehicle
        const response = await createVehicle(values);
        if (response.success) {
          message.success('Vehicle created successfully');
          setModalVisible(false);
          fetchVehicles();
        }
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to save vehicle');
    }
  };

  const columns: ColumnsType<VehicleData> = [
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
      title: 'Type',
      dataIndex: 'vehicleType',
      key: 'vehicleType',
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
            onConfirm={() => handleDeleteVehicle(record._id!)}
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
      width: 600,
      content: (
        <div>
          <Row gutter={[16, 16]}>
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
              <strong>Type:</strong> {vehicle.vehicleType}
            </Col>
            <Col span={12}>
              <strong>Status:</strong> 
              <Tag color={vehicle.status === 'available' ? 'green' : 'blue'} style={{ marginLeft: 8 }}>
                {vehicle.status.toUpperCase()}
              </Tag>
            </Col>
            <Col span={12}>
              <strong>Created:</strong> {new Date(vehicle.createdAt!).toLocaleDateString()}
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
        title="Vehicle Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddVehicle}
          >
            Add New Vehicle
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
        />
      </Card>

      <Modal
        title={editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        open={modalVisible}
        onOk={handleModalSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          name="vehicleForm"
          initialValues={{
            vehicleType: 'sedan',
            status: 'available',
          }}
        >
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
                <Input placeholder="e.g., Camry" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
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
            <Col span={12}>
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
            <Col span={12}>
              <Form.Item
                name="color"
                label="Color"
                rules={[{ required: true, message: 'Please enter vehicle color' }]}
              >
                <Input placeholder="e.g., Red" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="vehicleType"
                label="Vehicle Type"
                rules={[{ required: true, message: 'Please select vehicle type' }]}
              >
                <Select placeholder="Select vehicle type">
                  <Option value="sedan">Sedan</Option>
                  <Option value="suv">SUV</Option>
                  <Option value="truck">Truck</Option>
                  <Option value="van">Van</Option>
                  <Option value="motorcycle">Motorcycle</Option>
                  <Option value="bus">Bus</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

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

export default VehicleList;