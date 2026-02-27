import React from 'react';
import { Modal, Typography, Tag, Card, Badge, Button, Divider } from 'antd';
import { 
  CarOutlined, 
  EnvironmentOutlined, 
  IdcardOutlined, 
  GlobalOutlined,
  PhoneOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  FieldTimeOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { CharterDriverDetail } from '@/services/admin/charter/charterDriverService';

const { Title, Text } = Typography;

interface CharterDriverDetailsModalProps {
  selectedDriver: CharterDriverDetail | null;
  visible: boolean;
  onClose: () => void;
}


const CharterDriverDetailsModal: React.FC<CharterDriverDetailsModalProps> = ({
  selectedDriver,
  visible,
  onClose,
}) => {
  if (!selectedDriver) return null;

  // Transform the data to ensure it has all needed fields
  const driver = {
    _id: selectedDriver._id,
    userId: {
      _id: selectedDriver.userId?._id || '',
      fullname: selectedDriver.userId?.fullname || 'N/A',
      email: selectedDriver.userId?.email || 'N/A',
      phone: selectedDriver.userId?.phone || 'N/A',
      isActive: selectedDriver.userId?.isActive || false,
      profileImage: selectedDriver.userId?.profileImage,
    },
    licenseNumber: selectedDriver.licenseNumber || '',
    address: selectedDriver.address || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Nigeria',
    },
    vehicleId: selectedDriver.vehicleId ? {
      _id: selectedDriver.vehicleId._id,
      make: selectedDriver.vehicleId.make,
      model: selectedDriver.vehicleId.model,
      year: selectedDriver.vehicleId.year,
      licensePlate: selectedDriver.vehicleId.licensePlate,
      color: selectedDriver.vehicleId.color,
      vehicleType: selectedDriver.vehicleId.vehicleType,
      capacity: selectedDriver.vehicleId.capacity,
      thumbnail: selectedDriver.vehicleId.thumbnail,
      status: selectedDriver.vehicleId.status,
      // features: selectedDriver.vehicleId.features, // Removed because 'features' does not exist on CharterVehicle
    } : undefined,
    totalTrips: selectedDriver.totalTrips || 0,
    isVerified: selectedDriver.isVerified || false,
    verifiedAt: selectedDriver.verifiedAt,
    verificationNotes: selectedDriver.verificationNotes,
    status: selectedDriver.status,
    experience: selectedDriver.experience || 0,
    specialLicenses: selectedDriver.specialLicenses || [],
    languages: selectedDriver.languages || [],
    emergencyContact: selectedDriver.emergencyContact,
    assignedCharters: selectedDriver.assignedCharters || [],
    createdAt: selectedDriver.createdAt,
    updatedAt: selectedDriver.updatedAt,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'pending': return 'orange';
      case 'suspended': return 'red';
      case 'inactive': return 'gray';
      default: return 'default';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <UserOutlined className="text-blue-500" />
          <span>Charter Driver Details</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose} type="primary">
          Close
        </Button>,
      ]}
      width={900}
      className="driver-details-modal"
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
            {driver.userId.fullname.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Title level={3} className="!mb-0">{driver.userId.fullname}</Title>
              <Tag color={getStatusColor(driver.status)} className="ml-2">
                {driver.status.toUpperCase()}
              </Tag>
              {driver.isVerified && (
                <Badge status="success" text="Verified" />
              )}
            </div>
            <div className="text-gray-600">{driver.userId.email} • {driver.userId.phone}</div>
          </div>
        </div>

        <Divider className="my-4" />

        {/* Driver Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Details */}
          <Card 
            title={
              <span className="flex items-center gap-2">
                <IdcardOutlined className="text-blue-500" />
                Personal Information
              </span>
            }
            className="shadow-sm"
          >
            <div className="space-y-3">
              <div>
                <Text type="secondary">License Number</Text>
                <div className="font-medium">{driver.licenseNumber}</div>
              </div>
              
              <div>
                <Text type="secondary">Experience</Text>
                <div className="font-medium">
                  <FieldTimeOutlined className="mr-2 text-blue-500" />
                  {driver.experience} years
                </div>
              </div>

              {driver.specialLicenses && driver.specialLicenses.length > 0 && (
                <div>
                  <Text type="secondary">Special Licenses</Text>
                  <div className="mt-1">
                    {driver.specialLicenses.map((license, index) => (
                      <Tag key={index} color="purple" className="mb-1">
                        <SafetyCertificateOutlined className="mr-1" />
                        {license.replace(/_/g, ' ')}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              {driver.languages && driver.languages.length > 0 && (
                <div>
                  <Text type="secondary">Languages</Text>
                  <div className="mt-1">
                    {driver.languages.map((lang, index) => (
                      <Tag key={index} color="cyan" className="mb-1">
                        <GlobalOutlined className="mr-1" />
                        {lang}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Address Information */}
          <Card 
            title={
              <span className="flex items-center gap-2">
                <EnvironmentOutlined className="text-green-500" />
                Address
              </span>
            }
            className="shadow-sm"
          >
            <div className="space-y-2">
              <div>{driver.address.street}</div>
              <div>
                {driver.address.city}, {driver.address.state} {driver.address.zipCode}
              </div>
              <div>{driver.address.country}</div>
            </div>
          </Card>
        </div>

        {/* Emergency Contact */}
        {driver.emergencyContact && (
          <Card 
            title={
              <span className="flex items-center gap-2">
                <PhoneOutlined className="text-orange-500" />
                Emergency Contact
              </span>
            }
            className="shadow-sm"
          >
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Text type="secondary">Name</Text>
                <div className="font-medium">{driver.emergencyContact.name}</div>
              </div>
              <div>
                <Text type="secondary">Phone</Text>
                <div className="font-medium">{driver.emergencyContact.phone}</div>
              </div>
              <div>
                <Text type="secondary">Relationship</Text>
                <div className="font-medium">{driver.emergencyContact.relationship}</div>
              </div>
            </div>
          </Card>
        )}

        {/* Vehicle Information */}
        {driver.vehicleId ? (
          <Card 
            title={
              <span className="flex items-center gap-2">
                <CarOutlined className="text-green-600" />
                Assigned Vehicle
              </span>
            }
            className="shadow-sm border-green-100"
            extra={
              <Tag color={driver.vehicleId.status === 'assigned' ? 'blue' : 'green'}>
                {driver.vehicleId.status.toUpperCase()}
              </Tag>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Image */}
              <div className="flex justify-center items-center bg-gray-50 rounded-lg p-4">
                {driver.vehicleId.thumbnail ? (
                  <img 
                    src={driver.vehicleId.thumbnail} 
                    alt={`${driver.vehicleId.make} ${driver.vehicleId.model}`}
                    className="max-h-32 object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <CarOutlined className="text-5xl text-gray-400" />
                    <div className="text-gray-500 mt-2">No image</div>
                  </div>
                )}
              </div>

              {/* Vehicle Details */}
              <div className="space-y-3">
                <div>
                  <Text type="secondary">Vehicle</Text>
                  <div className="font-medium text-lg">
                    {driver.vehicleId.make} {driver.vehicleId.model} ({driver.vehicleId.year})
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Text type="secondary">License Plate</Text>
                    <div><Tag color="blue">{driver.vehicleId.licensePlate}</Tag></div>
                  </div>
                  <div>
                    <Text type="secondary">Color</Text>
                    <div>
                      <Tag color={driver.vehicleId.color.toLowerCase()}>
                        {driver.vehicleId.color}
                      </Tag>
                    </div>
                  </div>
                  <div>
                    <Text type="secondary">Type</Text>
                    <div className="capitalize">{driver.vehicleId.vehicleType}</div>
                  </div>
                  <div>
                    <Text type="secondary">Capacity</Text>
                    <div>{driver.vehicleId.capacity} passengers</div>
                  </div>
                </div>

                {/* Features property does not exist on vehicleId, so this section is removed */}
              </div>
            </div>
          </Card>
        ) : (
          <Card className="shadow-sm bg-gray-50">
            <div className="text-center py-6 text-gray-500">
              <CarOutlined className="text-4xl mb-2 text-gray-400" />
              <div>No vehicle assigned to this driver</div>
            </div>
          </Card>
        )}

        {/* Statistics */}
        <Card 
          title={
            <span className="flex items-center gap-2">
              <StarOutlined className="text-yellow-500" />
              Performance Statistics
            </span>
          }
          className="shadow-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center bg-blue-50 border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{driver.totalTrips}</div>
              <div className="text-blue-700">Total Trips</div>
            </Card>
            
            <Card className="text-center bg-green-50 border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {driver.assignedCharters?.length || 0}
              </div>
              <div className="text-green-700">Active Charters</div>
            </Card>
            
            <Card className="text-center bg-purple-50 border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                {driver.isVerified ? 'Yes' : 'No'}
              </div>
              <div className="text-purple-700">Verified</div>
            </Card>

            <Card className="text-center bg-orange-50 border-orange-200">
              <div className="text-sm font-medium text-orange-700">Member Since</div>
              <div className="text-sm text-orange-600">
                {formatDate(driver.createdAt)}
              </div>
            </Card>
          </div>
        </Card>

        {/* Verification Details */}
        {driver.isVerified && driver.verifiedAt && (
          <Card className="shadow-sm bg-gray-50">
            <div className="flex items-center gap-2 text-gray-600">
              <SafetyCertificateOutlined className="text-green-500" />
              <span>Verified on {formatDate(driver.verifiedAt)}</span>
              {driver.verificationNotes && (
                <>
                  <span className="mx-2">•</span>
                  <span>Notes: {driver.verificationNotes}</span>
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default CharterDriverDetailsModal;