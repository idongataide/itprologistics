// services/admin/adminRideService.ts

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface Ride {
  _id: string;
  userId: string;
  userName?: string;
  phoneNumber?: string;
  driverId?: string;
  driverName?: string;
  pickupLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  destination: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  status: 'pending' | 'accepted' | 'in_progress' | 'awaiting_driver_confirmation' | 'completed' | 'cancelled';
  rideType: 'bicycle' | 'motorcycle' | 'car';
  totalFare: number;
  distance?: number;
  estimatedDuration?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Driver {
  _id: string;
  name: string;
  phone: string;
  status: 'active' | 'inactive' | 'on_ride';
  vehicle?: {
    make: string;
    model: string;
    licensePlate: string;
    color: string;
  };
  rating?: number;
  totalTrips?: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  rides?: Ride[];
  ride?: Ride;
  drivers?: Driver[];
  driver?: Driver;
}

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Get all rides (admin view)
export const getAllRides = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/rides`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch rides: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching all rides:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch rides',
      rides: [],
    };
  }
};

// Assign driver to a ride
export const assignDriverToRide = async (rideId: string, driverId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/rides/${rideId}/assign`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ driverId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to assign driver: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error assigning driver:', error);
    return {
      success: false,
      message: error.message || 'Failed to assign driver',
    };
  }
};

// Complete a ride
export const completeRide = async (rideId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/rides/${rideId}/complete`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to complete ride: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error completing ride:', error);
    return {
      success: false,
      message: error.message || 'Failed to complete ride',
    };
  }
};

// Decline/Cancel a ride
export const declineRide = async (rideId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/rides/${rideId}/decline`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to decline ride: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error declining ride:', error);
    return {
      success: false,
      message: error.message || 'Failed to decline ride',
    };
  }
};

// Get available drivers for a specific ride (matching vehicle type)
export const getAvailableDrivers = async (rideId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/drivers/available/${rideId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch drivers: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching available drivers:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch drivers',
      drivers: [],
    };
  }
};

// Get all drivers
export const getAllDrivers = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/drivers`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch drivers: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching drivers:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch drivers',
      drivers: [],
    };
  }
};

// Update ride status
export const updateRideStatus = async (rideId: string, status: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/rides/${rideId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update ride status: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error updating ride status:', error);
    return {
      success: false,
      message: error.message || 'Failed to update ride status',
    };
  }
};

export default {
  getAllRides,
  assignDriverToRide,
  completeRide,
  declineRide,
  getAvailableDrivers,
  getAllDrivers,
  updateRideStatus,
};
