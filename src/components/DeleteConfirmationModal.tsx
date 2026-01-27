import React from 'react';
import { Button } from 'antd';

interface DeleteConfirmationModalProps {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  itemName,
  onConfirm,
  onCancel,
  loading,
}) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center  bg-[#38383880] bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#1C2023]">Delete Fee</h3>
          <button onClick={onCancel} className="text-[#7D8489] hover:text-black">
            ✕
          </button>
        </div>
        <p className="text-[#667085] mb-6">
          You are about to delete <strong>{itemName}</strong>, will you want to proceed with this action?
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
            className="rounded-md h-[46px]! px-6! border border-transparent bg-[#FF6C2D]! py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            loading={loading}
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 