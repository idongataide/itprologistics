import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { deleteAccount } from '@/api/settingsApi';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import Images from '@/components/images';
import { useOnboardingStore } from '@/global/store';
import { useNavigate } from 'react-router-dom';


const DeleteAccount: React.FC = () => {
const navigate = useNavigate();
const [loading, setLoading] = useState(false);
const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirmModal(true);
  };

  const onConfirm = async () => {
    try {
      setLoading(true);
      const response = await deleteAccount();

      if (response?.status === 'ok') {
        toast.success('Account deleted successfully');
        useOnboardingStore.persist.clearStorage(); 
        localStorage.clear(); 
        sessionStorage.clear(); 
        useOnboardingStore.setState({ 
            token: null, 
            isAuthorized: false, 
            firstName: "", 
            lastName: "" 
        });
        
        navigate("/login");
      } else {
        const errorMessage = response?.response?.data?.msg || 'Failed to delete account';
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const onCancel = () => {
    setShowConfirmModal(false);
  };

  return (
    <div className="md:p-4 p-0 mx-auto max-w-xl">
      <Toaster />
      <div className='md:p-4 p-0 pt-0'>
        <div className="items-center">
          <div className="mb-5">
            <img src={Images.deletebg} alt="Booking Banner" className="w-full h-full object-cover" />    
          </div>
          <div className=''>
            <h4 className="font-semibold mb-1 text-[#344054]">Delete Account?</h4>
            <p className="text-[#667085]">
              We will delete profile and activity. If you change your mind you can recover your account within 28 days.
            </p>
          </div>            
          <Button 
            type="primary"
            danger
            loading={loading}
            onClick={handleDeleteClick}
            className="rounded-md w-[100%]! mt-5 h-[46px]! px-10 border border-transparent bg-[#F62B2B]! py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={showConfirmModal}
        onCancel={onCancel}
        footer={null}
        centered
        closable={false}
        className="[&_.ant-modal-content]:bg-white [&_.ant-modal-content]:rounded-lg [&_.ant-modal-content]:p-6 [&_.ant-modal-content]:max-w-sm"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#1C2023]">Delete Account</h3>
          <button 
            onClick={onCancel} 
            className="text-[#7D8489] hover:text-black text-lg"
            disabled={loading}
          >
            ✕
          </button>
        </div>
        <p className="text-[#667085] mb-6">
          You are about to delete your account. This action cannot be undone. 
          Are you sure you want to proceed?
        </p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-md border border-[#E5E9F0] text-[#475467] hover:bg-gray-50"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <Button
            type="primary"
            danger
            loading={loading}
            onClick={onConfirm}
            className="rounded-md h-[46px]! px-6! border border-transparent bg-[#F62B2B]! py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default DeleteAccount;