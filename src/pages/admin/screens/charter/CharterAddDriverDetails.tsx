import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  Row,
  Col,
  Spin,
} from 'antd';
import {
  IdcardOutlined,
  HomeOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import charterDriverService from '@/services/admin/charter/charterDriverService';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;

interface DriverInfoFormData {
  licenseNumber: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  experience?: string;
  languages?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelationship?: string;
}

const CharterAddDriverDetails: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<{ fullname: string; email: string } | null>(null);
  const navigate = useNavigate();
  const { driverId } = useParams<{ driverId: string }>();

  useEffect(() => {
    if (driverId) {
      fetchUserInfo(driverId);
    }
  }, [driverId]);

  const fetchUserInfo = async (userId: string) => {
    setUserLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUserInfo({
            fullname: data.user.name,
            email: data.user.email,
          });
        }
      } else {
        console.error('Failed to fetch user info:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      setUserLoading(false);
    }
  };

  const onFinish = async (values: DriverInfoFormData) => {
    if (!driverId) {
      toast.error('Driver ID is missing');
      return;
    }
  
    setLoading(true);
    try {
      // Process languages if provided
      const languages = values.languages ?
        values.languages.split(',').map((lang: string) => lang.trim()).filter(Boolean) :
        [];

      const driverDetailsData = {
        userId: driverId,
        licenseNumber: values.licenseNumber,
        address: {
          street: values.street,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country || 'Nigeria'
        },
        experience: values.experience ? parseInt(values.experience) : 0,
        languages: languages,
        emergencyContact: values.emergencyName && values.emergencyPhone && values.emergencyRelationship ? {
          name: values.emergencyName,
          phone: values.emergencyPhone || '',
          relationship: values.emergencyRelationship || '',
        } : undefined,
      };
  
      await charterDriverService.createCharterDriverDetails(driverDetailsData);
      
      toast.success('Charter driver details added successfully!');
      navigate('/admin/charter/drivers');
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to save charter driver details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/admin/charter/drivers" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4">
            <ArrowLeftOutlined className="mr-2" />
            Back to Drivers
          </Link>
          <Title level={2} className="text-gray-800">Add Charter Driver Details</Title>
          <Text className="text-gray-600">Complete charter driver information with license, qualifications and address</Text>
        </div>

        <Card className="border-0 shadow-sm rounded-2xl">
          {userLoading ? (
            <div className="text-center py-8">
              <Spin size="large" />
              <Text className="block mt-4">Loading driver information...</Text>
            </div>
          ) : userInfo ? (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <Title level={4} className="text-gray-800 mb-2">Driver Information</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Name: </Text>
                  <Text>{userInfo.fullname}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Email: </Text>
                  <Text>{userInfo.email}</Text>
                </Col>
              </Row>
            </div>
          ) : null}

          <Form
            form={form}
            name="charter_driver_details"
            layout="vertical"
            onFinish={onFinish}
          >
            <Title level={4} className="text-gray-700 mb-6">Driver Information</Title>
            
            <Form.Item
              name="licenseNumber"
              label="Driver License Number"
              rules={[{ required: true, message: 'Please input license number!' }]}
            >
              <Input 
                prefix={<IdcardOutlined className="text-gray-400" />} 
                placeholder="DL-1234567890" 
                size="large" 
              />
            </Form.Item>

            <Form.Item
              name="experience"
              label="Years of Experience"
            >
              <Input 
                placeholder="e.g., 5" 
                size="large" 
              />
            </Form.Item>

            <Form.Item
              name="languages"
              label="Languages Spoken (comma separated)"
              tooltip="e.g., English, French, Hausa"
            >
              <Input 
                placeholder="English, French, Hausa" 
                size="large"
              />
            </Form.Item>

            <Title level={5} className="text-gray-700 mb-4">Address Information</Title>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="street"
                  label="Street"
                  rules={[{ required: true, message: 'Please input street address!' }]}
                >
                  <Input 
                    prefix={<HomeOutlined className="text-gray-400" />} 
                    placeholder="123 Main St" 
                    size="large" 
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="city"
                  label="City"
                  rules={[{ required: true, message: 'Please input city!' }]}
                >
                  <Input placeholder="Lagos" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="state"
                  label="State"
                  rules={[{ required: true, message: 'Please input state!' }]}
                >
                  <Input placeholder="Lagos State" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="zipCode"
                  label="Zip Code"
                  rules={[{ required: true, message: 'Please input zip code!' }]}
                >
                  <Input placeholder="100001" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="country"
                  label="Country"
                  rules={[{ required: true, message: 'Please input country!' }]}
                >
                  <Input placeholder="Nigeria" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Title level={5} className="text-gray-700 mb-4">Emergency Contact (Optional)</Title>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="emergencyName"
                  label="Contact Name"
                >
                  <Input placeholder="Jane Doe" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="emergencyPhone"
                  label="Contact Phone"
                >
                  <Input placeholder="+234 123 456 7890" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="emergencyRelationship"
                  label="Relationship"
                >
                  <Input placeholder="Spouse" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item className="mt-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/admin/charter/drivers" className="w-full sm:w-auto">
                  <Button 
                    size="large" 
                    className="h-12 w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  className="h-12 w-full sm:w-auto"
                >
                  Save Driver Details
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default CharterAddDriverDetails;