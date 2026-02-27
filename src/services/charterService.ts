// src/services/charterService.ts

import { API_URL } from "./config/api";

export interface CharterBookingRequest {
  pickupLocation: string;
  destination: string;
  vehicleNeeded: string;
  passengers?: number;
  specialRequests?: string;
  tripDate?: string;
  tripTime?: string;
}

export interface CharterOrder {
  _id: string;
  userId: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  pickupLocation: string;
  destination: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  vehicleNeeded: string;
  passengers?: number;
  specialRequests?: string;
  tripDate?: string;
  tripTime?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  order?: CharterOrder;
  orders?: CharterOrder[];
}

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Book a charter
export const bookCharter = async (bookingData: CharterBookingRequest): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/charter/book`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookingData),
    });

    const data: ApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to book charter');
    }

    return data;
  } catch (error: any) {
    console.error('Error booking charter:', error);
    return {
      success: false,
      message: error.message || 'Failed to book charter',
    };
  }
};

// Get user's charter orders
export const getUserCharterOrders = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/charter/orders`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data: ApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch charter orders');
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching charter orders:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch charter orders',
      orders: [],
    };
  }
};

// Get specific charter order
export const getCharterOrder = async (orderId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/charter/order/${orderId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data: ApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch charter order');
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching charter order:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch charter order',
    };
  }
};

// Cancel charter order
export const cancelCharterOrder = async (orderId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/charter/order/${orderId}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });

    const data: ApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to cancel charter order');
    }

    return data;
  } catch (error: any) {
    console.error('Error cancelling charter order:', error);
    return {
      success: false,
      message: error.message || 'Failed to cancel charter order',
    };
  }
};

const charterService = {
  bookCharter,
  getUserCharterOrders,
  getCharterOrder,
  cancelCharterOrder,
};

export default charterService;
