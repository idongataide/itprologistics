import React, { useState } from 'react';
import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  message,
  DatePicker,
  InputNumber,
} from 'antd';
import {
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface OrderFormData {
  riderName: string;
  pickupLocation: string;
  destination: string;
  dateTime: dayjs.Dayjs;
  fare: number;
}

const AdminCreateOrders: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = (values: OrderFormData) => {
    setLoading(true);
    console.log('Received values of form: ', values);
    // Simulate API call
    setTimeout(() => {
      message.success(`Order created for ${values.riderName} successfully!`);
      form.resetFields();
      setLoading(false);
      // Optionally navigate to a rides list page or dashboard
      navigate('/admin/rides');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Title level={2} className="text-gray-800">Create New Ride Order</Title>
          <Text className="text-gray-600">Manually create a ride order for a user.</Text>
        </div>

        <Card className="border-0 shadow-sm rounded-2xl">
          <Form
            form={form}
            name="create_order"
            layout="vertical"
            onFinish={onFinish}
            className="mt-4"
          >
            <Form.Item
              name="riderName"
              label="Rider's Name"
              rules={[{ required: true, message: "Please input the rider's name!" }]}
            >
              <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Rider Name" size="large" />
            </Form.Item>

            <Form.Item
              name="pickupLocation"
              label="Pickup Location"
              rules={[{ required: true, message: 'Please input the pickup location!' }]}
            >
              <Input prefix={<EnvironmentOutlined className="text-gray-400" />} placeholder="Pickup Location" size="large" />
            </Form.Item>

            <Form.Item
              name="destination"
              label="Destination"
              rules={[{ required: true, message: 'Please input the destination!' }]}
            >
              <Input prefix={<EnvironmentOutlined className="text-gray-400" />} placeholder="Destination" size="large" />
            </Form.Item>

            <Form.Item
              name="dateTime"
              label="Date & Time"
              rules={[{ required: true, message: 'Please select date and time!' }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                className="w-full"
                size="large"
                prefix={<CalendarOutlined className="text-gray-400" />}
              />
            </Form.Item>

            <Form.Item
              name="fare"
              label="Estimated Fare (N)"
              rules={[{ required: true, message: 'Please input the estimated fare!' }]}
            >
              <InputNumber
                placeholder="Fare"
                min={0}
                className="w-full"
                size="large"
                formatter={value => `N ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 border-0 hover:from-orange-600 hover:to-red-600 h-12 shadow-lg mt-4"
              >
                Create Order
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default AdminCreateOrders;
