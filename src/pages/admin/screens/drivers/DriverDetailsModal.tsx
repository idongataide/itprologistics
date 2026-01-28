import React from 'react';
import { Modal, Typography, Tag, Card, Badge, Button } from 'antd';
import { CarOutlined } from '@ant-design/icons';
import { DriverDetail } from '@/types';

const { Title, Text } = Typography;

interface DriverDetailsModalProps {
  selectedDriver: DriverDetail | null;
  visible: boolean;
  onClose: () => void;
}

const DriverDetailsModal: React.FC<DriverDetailsModalProps> = ({
  selectedDriver,
  visible,
  onClose,
}) => {
  if (!selectedDriver) return null;

  return (
    <Modal
      title="Driver Details"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={800}
    >
      <div className="space-y-6">
        {/* Driver Information */}
        <div>
          <Title level={4} className="mb-4">Driver Information</Title>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text strong>Name:</Text>
              <div className="text-gray-700">{selectedDriver.userId.name}</div>
            </div>
            <div>
              <Text strong>Email:</Text>
              <div className="text-gray-700">{selectedDriver.userId.email}</div>
            </div>
            <div>
              <Text strong>Phone:</Text>
              <div className="text-gray-700">{selectedDriver.userId.phone || 'N/A'}</div>
            </div>
            <div>
              <Text strong>License Number:</Text>
              <div className="text-gray-700">{selectedDriver.licenseNumber}</div>
            </div>
            <div>
              <Text strong>Status:</Text>
              <div>
                <Tag color={
                  selectedDriver.status === 'active' ? 'green' :
                  selectedDriver.status === 'pending' ? 'orange' :
                  selectedDriver.status === 'suspended' ? 'red' : 'gray'
                }>
                  {selectedDriver.status}
                </Tag>
              </div>
            </div>
            <div>
              <Text strong>Verification:</Text>
              <div>
                {selectedDriver.isVerified ? (
                  <Badge status="success" text="Verified" />
                ) : (
                  <Badge status="warning" text="Pending Verification" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <Title level={4} className="mb-4">Address</Title>
          <div className="bg-gray-50 p-4 rounded">
            {selectedDriver.address.street},<br />
            {selectedDriver.address.city}, {selectedDriver.address.state}<br />
            {selectedDriver.address.postalCode}, {selectedDriver.address.country}
          </div>
        </div>

        {/* Vehicle Information */}
        {selectedDriver.vehicleId ? (
          <div>
            <Title level={4} className="mb-4">Assigned Vehicle</Title>
            <Card>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text strong>Vehicle:</Text>
                  <div className="text-gray-700">{selectedDriver.vehicleId.make} {selectedDriver.vehicleId.model} ({selectedDriver.vehicleId.year})</div>
                </div>
                <div>
                  <Text strong>License Plate:</Text>
                  <div className="text-gray-700">{selectedDriver.vehicleId.licensePlate}</div>
                </div>
                <div>
                  <Text strong>Color:</Text>
                  <div className="text-gray-700">{selectedDriver.vehicleId.color || 'N/A'}</div>
                </div>
                <div>
                  <Text strong>Type:</Text>
                  <div className="text-gray-700">{selectedDriver.vehicleId.vehicleType}</div>
                </div>
                <div>
                  <Text strong>Capacity:</Text>
                  <div className="text-gray-700">{selectedDriver.vehicleId.capacity} passengers</div>
                </div>
                <div>
                  <Text strong>Vehicle Status:</Text>
                  <div>
                    <Tag color={selectedDriver.vehicleId.status === 'active' ? 'green' : 'orange'}>
                      {selectedDriver.vehicleId.status}
                    </Tag>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CarOutlined className="text-3xl mb-2" />
            <div>No vehicle assigned</div>
          </div>
        )}

        {/* Statistics */}
        <div>
          <Title level={4} className="mb-4">Statistics</Title>
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center">
              <div className="text-2xl font-bold text-blue-600">{selectedDriver.totalTrips}</div>
              <div className="text-gray-600">Total Trips</div>
            </Card>
            <Card className="text-center">
              <div className="text-2xl font-bold text-green-600">${selectedDriver.totalEarnings.toFixed(2)}</div>
              <div className="text-gray-600">Total Earnings</div>
            </Card>
            <Card className="text-center">
              <div className="flex items-center justify-center">
                <span className="text-yellow-500 text-2xl mr-2">★</span>
                <span className="text-2xl font-bold">{selectedDriver.driverRating.toFixed(1)}</span>
                <span className="text-gray-600 ml-2">/5</span>
              </div>
              <div className="text-gray-600">Rating</div>
            </Card>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DriverDetailsModal;