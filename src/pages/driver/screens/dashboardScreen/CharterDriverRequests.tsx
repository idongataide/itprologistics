import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Spin,
  Empty,
  Tabs,
  Badge,
  Typography,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import charterDriverService, { CharterDriverRequest } from '@/services/charterDriverService';

const { Title, Text } = Typography;

const CharterDriverRequests: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [requests, setRequests] = useState<CharterDriverRequest[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<CharterDriverRequest | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await charterDriverService.getCharterDriverRequests();
      if (response.success && response.requests) {
        setRequests(response.requests);
      } else {
        toast.error(response.message || 'Failed to fetch requests');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRequests = () => {
    if (activeTab === 'all') {
      return requests;
    }
    return requests.filter(req => req.status === activeTab);
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      pending: { color: 'orange', text: 'Pending', icon: <ClockCircleOutlined /> },
      accepted: { color: 'blue', text: 'Accepted', icon: <CheckCircleOutlined /> },
      completed: { color: 'green', text: 'Completed', icon: <CheckCircleOutlined /> },
      rejected: { color: 'red', text: 'Rejected', icon: <CloseCircleOutlined /> },
      cancelled: { color: 'red', text: 'Cancelled', icon: <CloseCircleOutlined /> },
    };

    const config = statusConfig[status] || { color: 'default', text: status, icon: null };
    return (
      <Tag color={config.color} icon={config.icon} className="flex items-center gap-1 w-fit">
        {config.text}
      </Tag>
    );
  };

  const handleAcceptRequest = (request: CharterDriverRequest) => {
    Modal.confirm({
      title: 'Accept Charter Request',
      icon: <CheckCircleOutlined className="text-blue-500" />,
      content: (
        <div className="py-2">
          <Text>Are you sure you want to accept this charter request?</Text>
          <div className="mt-3 p-3 bg-gray-50 rounded">
            <p><strong>Customer:</strong> {request.user?.name}</p>
            <p><strong>Pickup:</strong> {request.pickupLocation}</p>
            <p><strong>Destination:</strong> {request.destination}</p>
            <p><strong>Date:</strong> {dayjs(request.tripDate).format('MMM D, YYYY')}</p>
            {request.estimatedFare && <p><strong>Estimated Fare:</strong> ₦{request.estimatedFare}</p>}
          </div>
        </div>
      ),
      okText: 'Yes, Accept',
      cancelText: 'Cancel',
      onOk: async () => {
        setActionLoading(true);
        try {
          const response = await charterDriverService.acceptCharterRequest(request._id);
          if (response.success) {
            toast.success('Request accepted successfully!');
            fetchRequests();
          } else {
            toast.error(response.message || 'Failed to accept request');
          }
        } catch (error: any) {
          toast.error(error.message || 'Failed to accept request');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleRejectRequest = (request: CharterDriverRequest) => {
    setSelectedRequest(request);
    setRejectModalVisible(true);
  };

  const confirmRejectRequest = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      const response = await charterDriverService.rejectCharterRequest(selectedRequest._id, rejectReason);
      if (response.success) {
        toast.success('Request rejected');
        setRejectModalVisible(false);
        setRejectReason('');
        fetchRequests();
      } else {
        toast.error(response.message || 'Failed to reject request');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteRequest = (request: CharterDriverRequest) => {
    Modal.confirm({
      title: 'Complete Charter Request',
      icon: <CheckCircleOutlined className="text-green-500" />,
      content: (
        <div className="py-2">
          <Text>Mark this charter as completed?</Text>
          <div className="mt-3 p-3 bg-gray-50 rounded">
            <p><strong>Customer:</strong> {request.user?.name}</p>
            <p><strong>Route:</strong> {request.pickupLocation} → {request.destination}</p>
            {request.distance && <p><strong>Distance:</strong> {request.distance} km</p>}
            {request.estimatedFare && <p><strong>Fare:</strong> ₦{request.estimatedFare}</p>}
          </div>
        </div>
      ),
      okText: 'Yes, Complete',
      cancelText: 'Cancel',
      onOk: async () => {
        setActionLoading(true);
        try {
          const response = await charterDriverService.completeCharterRequest(request._id);
          if (response.success) {
            toast.success('Request marked as completed!');
            fetchRequests();
          } else {
            toast.error(response.message || 'Failed to complete request');
          }
        } catch (error: any) {
          toast.error(error.message || 'Failed to complete request');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const showDetails = (request: CharterDriverRequest) => {
    setSelectedRequest(request);
    setDetailsModalVisible(true);
  };

  const columns = [
    {
      title: 'Customer',
      key: 'customer',
      render: (_: any, record: CharterDriverRequest) => (
        <div className="flex items-center">
          <UserOutlined className="text-gray-400 mr-2" />
          <div>
            <Text className="block font-medium">{record.user?.name || 'N/A'}</Text>
            <Text type="secondary" className="text-xs">{record.user?.phone}</Text>
          </div>
        </div>
      ),
      width: 150,
    },
    {
      title: 'Route',
      key: 'route',
      render: (_: any, record: CharterDriverRequest) => (
        <div className="space-y-1">
          <div className="flex items-start">
            <EnvironmentOutlined className="text-green-500 mr-2 mt-1 flex-shrink-0 text-sm" />
            <Text className="text-sm">{record.pickupLocation}</Text>
          </div>
          <div className="flex items-start">
            <EnvironmentOutlined className="text-red-500 mr-2 mt-1 flex-shrink-0 text-sm" />
            <Text className="text-sm">{record.destination}</Text>
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: 'Trip Date & Time',
      key: 'tripDateTime',
      render: (_: any, record: CharterDriverRequest) => (
        <div>
          <Text className="block">
            <CalendarOutlined className="mr-1" />
            {dayjs(record.tripDate).format('MMM D, YYYY')}
          </Text>
          {record.tripTime && <Text type="secondary" className="block text-xs">{record.tripTime}</Text>}
        </div>
      ),
      width: 140,
    },
    {
      title: 'Passengers',
      dataIndex: 'passengers',
      key: 'passengers',
      render: (passengers: number) => <Text className="font-medium">{passengers} pax</Text>,
      width: 80,
    },
    {
      title: 'Fare',
      key: 'fare',
      render: (_: any, record: CharterDriverRequest) => (
        <Text className="font-semibold text-green-600">
          {record.estimatedFare ? `₦${record.estimatedFare}` : 'N/A'}
        </Text>
      ),
      width: 100,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: CharterDriverRequest) => getStatusTag(record.status),
      width: 100,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_: any, record: CharterDriverRequest) => {
        const isPending = record.status === 'pending';
        const isAccepted = record.status === 'accepted';

        return (
          <Space wrap size="small">
            <Button
              type="text"
              size="small"
              onClick={() => showDetails(record)}
            >
              View Details
            </Button>
            {isPending && (
              <>
                <Button
                  type="primary"
                  size="small"
                  className="bg-blue-500 hover:bg-blue-600 border-0"
                  onClick={() => handleAcceptRequest(record)}
                  loading={actionLoading}
                >
                  Accept
                </Button>
                <Button
                  danger
                  size="small"
                  onClick={() => handleRejectRequest(record)}
                  loading={actionLoading}
                >
                  Reject
                </Button>
              </>
            )}
            {isAccepted && (
              <Button
                type="primary"
                size="small"
                className="bg-green-500 hover:bg-green-600 border-0"
                onClick={() => handleCompleteRequest(record)}
                loading={actionLoading}
              >
                Complete
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
        {/* Header */}
        <div className="mb-8">
          <Title level={2} className="text-gray-800 mb-0">Charter Requests</Title>
          <Text className="text-gray-600">View and manage charter requests sent to you</Text>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-sm rounded-2xl">
          {/* Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'all',
                label: (
                  <span className="flex items-center gap-2">
                    All Requests
                    <Badge count={requests.length} style={{ backgroundColor: '#1890ff' }} />
                  </span>
                ),
              },
              {
                key: 'pending',
                label: (
                  <span className="flex items-center gap-2">
                    <ClockCircleOutlined />
                    Pending
                    <Badge count={requests.filter(r => r.status === 'pending').length} style={{ backgroundColor: '#faad14' }} />
                  </span>
                ),
              },
              {
                key: 'accepted',
                label: (
                  <span className="flex items-center gap-2">
                    <CheckCircleOutlined />
                    Accepted
                    <Badge count={requests.filter(r => r.status === 'accepted').length} style={{ backgroundColor: '#1890ff' }} />
                  </span>
                ),
              },
              {
                key: 'completed',
                label: (
                  <span className="flex items-center gap-2">
                    <CheckCircleOutlined />
                    Completed
                    <Badge count={requests.filter(r => r.status === 'completed').length} style={{ backgroundColor: '#52c41a' }} />
                  </span>
                ),
              },
              {
                key: 'rejected',
                label: (
                  <span className="flex items-center gap-2">
                    <CloseCircleOutlined />
                    Rejected
                    <Badge count={requests.filter(r => r.status === 'rejected').length} style={{ backgroundColor: '#f5222d' }} />
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
          ) : getFilteredRequests().length > 0 ? (
            <Table
              dataSource={getFilteredRequests()}
              columns={columns}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              rowKey="_id"
              className="mt-4"
              scroll={{ x: 1400 }}
            />
          ) : (
            <Empty
              description="No charter requests"
              style={{ marginTop: 50, marginBottom: 50 }}
            />
          )}
        </Card>

        {/* Details Modal */}
        <Modal
          title="Request Details"
          open={detailsModalVisible}
          onCancel={() => setDetailsModalVisible(false)}
          footer={null}
          width={600}
        >
          {selectedRequest && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div>
                <Title level={5} className="text-gray-700">Customer Information</Title>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Text className="text-gray-600">Name:</Text>
                    <Text className="font-medium">{selectedRequest.user?.name}</Text>
                  </div>
                  <div className="flex items-center justify-between">
                    <Text className="text-gray-600">Email:</Text>
                    <Text className="font-medium">{selectedRequest.user?.email}</Text>
                  </div>
                  <div className="flex items-center justify-between">
                    <Text className="text-gray-600">Phone:</Text>
                    <Text className="font-medium">{selectedRequest.user?.phone}</Text>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Trip Info */}
              <div>
                <Title level={5} className="text-gray-700">Trip Information</Title>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <Text type="secondary" className="block text-sm mb-1">Pickup Location</Text>
                    <Text className="block font-medium">{selectedRequest.pickupLocation}</Text>
                  </div>
                  <div>
                    <Text type="secondary" className="block text-sm mb-1">Destination</Text>
                    <Text className="block font-medium">{selectedRequest.destination}</Text>
                  </div>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text type="secondary" className="block text-sm mb-1">Date</Text>
                      <Text className="font-medium">{dayjs(selectedRequest.tripDate).format('MMM D, YYYY')}</Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary" className="block text-sm mb-1">Time</Text>
                      <Text className="font-medium">{selectedRequest.tripTime || 'Not specified'}</Text>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text type="secondary" className="block text-sm mb-1">Passengers</Text>
                      <Text className="font-medium">{selectedRequest.passengers}</Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary" className="block text-sm mb-1">Status</Text>
                      {getStatusTag(selectedRequest.status)}
                    </Col>
                  </Row>
                </div>
              </div>

              <Divider />

              {/* Trip Details */}
              <div>
                <Title level={5} className="text-gray-700">Trip Details</Title>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  {selectedRequest.distance && (
                    <div className="flex items-center justify-between">
                      <Text className="text-gray-600">Distance:</Text>
                      <Text className="font-medium">{selectedRequest.distance} km</Text>
                    </div>
                  )}
                  {selectedRequest.estimatedDuration && (
                    <div className="flex items-center justify-between">
                      <Text className="text-gray-600">Estimated Duration:</Text>
                      <Text className="font-medium">{selectedRequest.estimatedDuration} mins</Text>
                    </div>
                  )}
                  {selectedRequest.estimatedFare && (
                    <div className="flex items-center justify-between">
                      <Text className="text-gray-600">Estimated Fare:</Text>
                      <Text className="font-semibold text-green-600">₦{selectedRequest.estimatedFare}</Text>
                    </div>
                  )}
                </div>
              </div>

              {selectedRequest.specialRequests && (
                <>
                  <Divider />
                  <div>
                    <Title level={5} className="text-gray-700">Special Requests</Title>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <Text>{selectedRequest.specialRequests}</Text>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </Modal>

        {/* Reject Modal */}
        <Modal
          title="Reject Request"
          open={rejectModalVisible}
          onOk={confirmRejectRequest}
          onCancel={() => {
            setRejectModalVisible(false);
            setRejectReason('');
          }}
          okText="Reject"
          okType="danger"
          confirmLoading={actionLoading}
        >
          <div className="space-y-4">
            <Text>Are you sure you want to reject this request?</Text>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-lg"
              rows={4}
              placeholder="Optional: Enter reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CharterDriverRequests;
