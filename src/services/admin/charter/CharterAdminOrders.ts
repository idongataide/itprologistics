// src/services/admin/adminCharterOrderService.ts

import { API_URL } from "@/services/config/api";


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
  orders?: CharterOrder[];
  order?: CharterOrder;
}

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Get all charter orders
export const getAllCharterOrders = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/orders`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch charter orders: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
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

// Get single charter order by ID
export const getCharterOrderById = async (orderId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/orders/${orderId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch charter order: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching charter order:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch charter order',
    };
  }
};

// Update charter order status
export const updateCharterOrderStatus = async (orderId: string, status: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update charter order status: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error updating charter order status:', error);
    return {
      success: false,
      message: error.message || 'Failed to update charter order status',
    };
  }
};

// Accept charter order
export const acceptCharterOrder = async (orderId: string): Promise<ApiResponse> => {
  return updateCharterOrderStatus(orderId, 'accepted');
};

// Decline/Cancel charter order
export const declineCharterOrder = async (orderId: string): Promise<ApiResponse> => {
  return updateCharterOrderStatus(orderId, 'cancelled');
};

// Start charter order (mark as in progress)
export const startCharterOrder = async (orderId: string): Promise<ApiResponse> => {
  return updateCharterOrderStatus(orderId, 'in_progress');
};

// Complete charter order
export const completeCharterOrder = async (orderId: string): Promise<ApiResponse> => {
  return updateCharterOrderStatus(orderId, 'completed');
};

// Delete charter order
export const deleteCharterOrder = async (orderId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/orders/${orderId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete charter order: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error deleting charter order:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete charter order',
    };
  }
};

// Get charter orders by status
export const getCharterOrdersByStatus = async (status: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/orders/status/${status}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch charter orders by status: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching charter orders by status:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch charter orders by status',
      orders: [],
    };
  }
};

// Get charter orders by date range
export const getCharterOrdersByDateRange = async (startDate: string, endDate: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/orders/date-range?start=${startDate}&end=${endDate}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch charter orders by date range: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching charter orders by date range:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch charter orders by date range',
      orders: [],
    };
  }
};

// Get charter order statistics
export const getCharterOrderStats = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/orders/stats/summary`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch charter order statistics: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching charter order statistics:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch charter order statistics',
      stats: {
        total: 0,
        pending: 0,
        accepted: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
      },
    };
  }
};

// Export all functions as a single object (default export)
const adminCharterOrderService = {
  getAllCharterOrders,
  getCharterOrderById,
  updateCharterOrderStatus,
  acceptCharterOrder,
  declineCharterOrder,
  startCharterOrder,
  completeCharterOrder,
  deleteCharterOrder,
  getCharterOrdersByStatus,
  getCharterOrdersByDateRange,
  getCharterOrderStats,
};

export default adminCharterOrderService;