import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
// import driverService from '@/services/admin/driverService';

interface DriverPasswordModalProps {
  driverId: string;
  visible: boolean;
  onClose: () => void;
}

const DriverPasswordModal: React.FC<DriverPasswordModalProps> = ({  visible, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await form.validateFields(values.password);
      // const res = await driverService.changePassword(driverId, values.password);
      if (res.success) {
        message.success('Password updated successfully');
        onClose();
        form.resetFields();
      } else {
        message.error(res.message || 'Failed to update password');
      }
    } catch (err) {
      // Validation error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Update Driver Password"
      open={visible}
      onOk={handleOk}
      onCancel={() => { form.resetFields(); onClose(); }}
      confirmLoading={loading}
      okText="Update Password"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="password"
          label="New Password"
          rules={[{ required: true, message: 'Please enter a new password' }, { min: 6, message: 'Password must be at least 6 characters' }]}
        >
          <Input.Password placeholder="Enter new password" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DriverPasswordModal;
