// src/services/charterDriverService.ts

import { API_URL } from "@/services/config/api";


export interface CharterDriverUser {
  _id: string;
  fullname: string;
  email: string;
  phone: string;
  role: 'user' | 'driver' | 'charter-driver' | 'admin';
  isActive: boolean;
  createdAt: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  profileImage?: string | null;
}

export interface CharterVehicle {
  _id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vehicleType: 'sedan' | 'suv' | 'van' | 'bus' | 'minibus' | 'luxury' | 'sprinter' | 'coaster';
  capacity: number;
  thumbnail?: string;
  status: 'available' | 'assigned' | 'maintenance' | 'inactive';
}

export interface CharterDriverDetail {
  _id: string;
  userId: CharterDriverUser;
  licenseNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  vehicleId?: CharterVehicle;
  totalTrips: number;
  isVerified: boolean;
  verifiedAt?: string;
  verificationNotes?: string;
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  // Charter-specific fields
  experience: number;
  specialLicenses: string[];
  languages: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  assignedCharters?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCharterDriverAccountData {
  fullname: string;
  email: string;
  phone: string;
  password: string;
  role: 'driver';
}

export interface CreateCharterDriverDetailsData {
  userId: string;
  licenseNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  experience?: number;
  specialLicenses?: string[];
  languages?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface AssignCharterVehicleData {
  driverId: string;
  vehicleId: string;
}

export interface UpdateCharterDriverData {
  licenseNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status?: 'active' | 'pending' | 'suspended' | 'inactive';
  experience?: number;
  specialLicenses?: string[];
  languages?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface CharterDriversResponse {
  success: boolean;
  drivers: CharterDriverDetail[];
  count: number;
  stats?: {
    totalDrivers: number;
    activeDrivers: number;
    pendingDrivers: number;
    verifiedDrivers: number;
    driversWithVehicles: number;
  };
  message?: string;
}

export interface SingleCharterDriverResponse {
  success: boolean;
  driver: CharterDriverDetail;
  message?: string;
}

export interface CharterDriverSummaryStats {
  totalDrivers: number;
  activeDrivers: number;
  pendingDrivers: number;
  verifiedDrivers: number;
  driversWithVehicles: number;
  languageStats?: Array<{ _id: string; count: number }>;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Get all charter drivers
const getCharterDrivers = async (): Promise<CharterDriversResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/drivers`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please login again');
      }
      if (response.status === 403) {
        throw new Error('Access denied. Admin only');
      }
      throw new Error(data.message || 'Failed to fetch charter drivers');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching charter drivers:', error);
    throw new Error(error.message || 'Failed to fetch charter drivers');
  }
};

// Get charter driver by ID
const getCharterDriverById = async (id: string): Promise<SingleCharterDriverResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/drivers/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch charter driver');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching charter driver:', error);
    throw new Error(error.message || 'Failed to fetch charter driver');
  }
};

// Create charter driver account (user with driver role)
const createCharterDriverAccount = async (driverData: CreateCharterDriverAccountData): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        fullname: driverData.fullname,
        email: driverData.email,
        phone: driverData.phone,
        password: driverData.password,
        role: driverData.role || 'driver',
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create charter driver account');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error creating charter driver account:', error);
    throw new Error(error.message || 'Failed to create charter driver account');
  }
};

// Create charter driver details
const createCharterDriverDetails = async (detailsData: CreateCharterDriverDetailsData): Promise<SingleCharterDriverResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/drivers/details`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(detailsData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create charter driver details');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error creating charter driver details:', error);
    throw new Error(error.message || 'Failed to create charter driver details');
  }
};

// Update charter driver
const updateCharterDriver = async (id: string, driverData: UpdateCharterDriverData): Promise<SingleCharterDriverResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/drivers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(driverData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update charter driver');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error updating charter driver:', error);
    throw new Error(error.message || 'Failed to update charter driver');
  }
};

// Delete charter driver
const deleteCharterDriver = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/drivers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete charter driver');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error deleting charter driver:', error);
    throw new Error(error.message || 'Failed to delete charter driver');
  }
};

// Update charter driver status
const updateCharterDriverStatus = async (id: string, status: 'active' | 'suspended' | 'inactive' | 'pending'): Promise<SingleCharterDriverResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/drivers/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update charter driver status');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error updating charter driver status:', error);
    throw new Error(error.message || 'Failed to update charter driver status');
  }
};

// Verify charter driver
const verifyCharterDriver = async (id: string, notes?: string): Promise<SingleCharterDriverResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/drivers/${id}/verify`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        verificationNotes: notes 
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify charter driver');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error verifying charter driver:', error);
    throw new Error(error.message || 'Failed to verify charter driver');
  }
};

// Assign vehicle to charter driver
const assignCharterVehicle = async (assignData: AssignCharterVehicleData): Promise<SingleCharterDriverResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/drivers/${assignData.driverId}/assign-vehicle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ vehicleId: assignData.vehicleId }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to assign vehicle to charter driver');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error assigning vehicle to charter driver:', error);
    throw new Error(error.message || 'Failed to assign vehicle to charter driver');
  }
};

// Unassign vehicle from charter driver
const unassignCharterVehicle = async (driverId: string): Promise<SingleCharterDriverResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/drivers/${driverId}/unassign-vehicle`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to unassign vehicle from charter driver');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error unassigning vehicle from charter driver:', error);
    throw new Error(error.message || 'Failed to unassign vehicle from charter driver');
  }
};

// Get charter driver statistics
const getCharterDriverStats = async (): Promise<{ success: boolean; stats: CharterDriverSummaryStats; message?: string }> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/drivers/stats/summary`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch charter driver statistics');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching charter driver statistics:', error);
    throw new Error(error.message || 'Failed to fetch charter driver statistics');
  }
};

// Get charter drivers without vehicles (available for assignment)
const getCharterDriversWithoutVehicles = async (): Promise<CharterDriversResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/drivers/available/without-vehicles`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch charter drivers without vehicles');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching charter drivers without vehicles:', error);
    throw new Error(error.message || 'Failed to fetch charter drivers without vehicles');
  }
};

// Alias for assignCharterVehicle (for backward compatibility)
const assignVehicleToCharterDriver = assignCharterVehicle;

// Export all functions
const charterDriverService = {
  getCharterDrivers,
  getCharterDriverById,
  createCharterDriverAccount,
  createCharterDriverDetails,
  updateCharterDriver,
  deleteCharterDriver,
  updateCharterDriverStatus,
  verifyCharterDriver,
  assignCharterVehicle,
  unassignCharterVehicle,
  assignVehicleToCharterDriver,
  getCharterDriverStats,
  getCharterDriversWithoutVehicles,
};

export default charterDriverService;