// src/services/charterDriverService.ts

import { API_URL } from "./config/api";

export interface CharterDriverRequest {
  _id: string;
  driverId: string;
  pickupLocation: string;
  destination: string;
  pickupLat: number;
  pickupLng: number;
  destLat: number;
  destLng: number;
  tripDate: string;
  tripTime?: string;
  passengers: number;
  specialRequests?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  estimatedFare?: number;
  distance?: number;
  estimatedDuration?: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  requests?: CharterDriverRequest[];
  request?: CharterDriverRequest;
}

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Get all charter requests sent to a specific driver
export const getCharterDriverRequests = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/charter-driver/requests`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch charter driver requests: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching charter driver requests:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch charter driver requests',
      requests: [],
    };
  }
};

// Get pending requests only
export const getPendingCharterRequests = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/charter-driver/requests/pending`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pending requests: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching pending requests:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch pending requests',
      requests: [],
    };
  }
};

// Accept a charter request
export const acceptCharterRequest = async (requestId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/charter-driver/requests/${requestId}/accept`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to accept request: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error accepting request:', error);
    return {
      success: false,
      message: error.message || 'Failed to accept request',
    };
  }
};

// Reject a charter request
export const rejectCharterRequest = async (requestId: string, reason?: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/charter-driver/requests/${requestId}/reject`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error(`Failed to reject request: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error rejecting request:', error);
    return {
      success: false,
      message: error.message || 'Failed to reject request',
    };
  }
};

// Get a specific charter request
export const getCharterRequest = async (requestId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/charter-driver/requests/${requestId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch request: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching request:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch request',
    };
  }
};

// Complete a charter request
export const completeCharterRequest = async (requestId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/charter-driver/requests/${requestId}/complete`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to complete request: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error completing request:', error);
    return {
      success: false,
      message: error.message || 'Failed to complete request',
    };
  }
};

const charterDriverService = {
  getCharterDriverRequests,
  getPendingCharterRequests,
  acceptCharterRequest,
  rejectCharterRequest,
  getCharterRequest,
  completeCharterRequest,
};

export default charterDriverService;
