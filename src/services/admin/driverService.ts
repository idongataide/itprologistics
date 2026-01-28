// src/services/driverService.ts

import { API_URL } from "../config/api";

export interface DriverUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'driver' | 'admin';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  createdAt: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  profileImage?: string | null;
}

export interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vehicleType: 'sedan' | 'suv' | 'van' | 'luxury';
  status: 'available' | 'assigned' | 'maintenance';
}

export interface DriverDetail {
  _id: string;
  userId: DriverUser;
  licenseNumber: string;
  licenseExpiry: string;
  licenseType: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  vehicleId?: Vehicle;
  totalTrips: number;
  totalEarnings: number;
  driverRating: number;
  isVerified: boolean;
  verifiedAt?: string;
  verificationNotes?: string;
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  documents?: {
    licenseFront: string;
    licenseBack: string;
    insurance: string;
    registration: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateDriverAccountData {
  fullname: string;
  email: string;
  phone: string;
  password: string;
  role: 'driver';
  status?: 'active' | 'pending';
}

export interface CreateDriverDetailsData {
  userId: string;
  licenseNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

}

export interface AssignVehicleData {
  driverId: string;
  vehicleId: string;
}

export interface UpdateDriverData {
  licenseNumber?: string;
  licenseExpiry?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  status?: 'active' | 'pending' | 'suspended' | 'inactive';
}

export interface DriversResponse {
  stats: any;
  success: boolean;
  drivers: DriverDetail[];
  count: number;
  message?: string;
}

export interface SingleDriverResponse {
  success: boolean;
  driver: DriverDetail;
  message?: string;
}

export interface DriverSummaryStats {
  totalDrivers: number;
  activeDrivers: number;
  pendingDrivers: number;
  verifiedDrivers: number;
  driversWithVehicles: number;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Get all drivers (including those without driver details)
const getDrivers = async (): Promise<DriversResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/drivers`, {
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
      throw new Error(data.message || 'Failed to fetch drivers');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching drivers:', error);
    throw new Error(error.message || 'Failed to fetch drivers');
  }
};

// Get driver by ID
const getDriverById = async (id: string): Promise<SingleDriverResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/drivers/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch driver');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching driver:', error);
    throw new Error(error.message || 'Failed to fetch driver');
  }
};

// Create driver account (user with driver role)
const createDriverAccount = async (driverData: CreateDriverAccountData): Promise<any> => {
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
        status: driverData.status || 'pending',
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create driver account');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error creating driver account:', error);
    throw new Error(error.message || 'Failed to create driver account');
  }
};

// Create driver details
const createDriverDetails = async (detailsData: CreateDriverDetailsData): Promise<SingleDriverResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/drivers/details`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(detailsData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create driver details');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error creating driver details:', error);
    throw new Error(error.message || 'Failed to create driver details');
  }
};

// Update driver
const updateDriver = async (id: string, driverData: UpdateDriverData): Promise<SingleDriverResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/drivers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(driverData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update driver');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error updating driver:', error);
    throw new Error(error.message || 'Failed to update driver');
  }
};

// Delete driver (both driver details and user account)
const deleteDriver = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/admin/drivers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete driver');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error deleting driver:', error);
    throw new Error(error.message || 'Failed to delete driver');
  }
};

// Update driver status
const updateDriverStatus = async (id: string, status: 'active' | 'suspended' | 'inactive'): Promise<SingleDriverResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/drivers/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update driver status');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error updating driver status:', error);
    throw new Error(error.message || 'Failed to update driver status');
  }
};

// Verify driver
const verifyDriver = async (id: string, notes?: string): Promise<SingleDriverResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/drivers/${id}/verify`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        isVerified: true, 
        verifiedAt: new Date().toISOString(),
        verificationNotes: notes 
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify driver');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error verifying driver:', error);
    throw new Error(error.message || 'Failed to verify driver');
  }
};

// Assign vehicle to driver
const assignVehicle = async (assignData: AssignVehicleData): Promise<SingleDriverResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/drivers/${assignData.driverId}/assign-vehicle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ vehicleId: assignData.vehicleId }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to assign vehicle');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error assigning vehicle:', error);
    throw new Error(error.message || 'Failed to assign vehicle');
  }
};

// Unassign vehicle from driver
const unassignVehicle = async (driverId: string): Promise<SingleDriverResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/drivers/${driverId}/unassign-vehicle`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to unassign vehicle');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error unassigning vehicle:', error);
    throw new Error(error.message || 'Failed to unassign vehicle');
  }
};

// Get driver statistics
const getDriverStats = async (): Promise<{ success: boolean; stats: DriverSummaryStats; message?: string }> => {
  try {
    const response = await fetch(`${API_URL}/admin/drivers/stats/summary`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch driver statistics');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching driver statistics:', error);
    throw new Error(error.message || 'Failed to fetch driver statistics');
  }
};


// Get drivers without vehicles
const getDriversWithoutVehicles = async (): Promise<DriversResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/drivers/without-vehicles`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch drivers without vehicles');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error fetching drivers without vehicles:', error);
    throw new Error(error.message || 'Failed to fetch drivers without vehicles');
  }
};

// Create vehicle
const createVehicle = async (vehicleData: {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  vehicleType: string;
}): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/admin/vehicles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(vehicleData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create vehicle');
    }

    return data;
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    throw new Error(error.message || 'Failed to create vehicle');
  }
};

// Assign vehicle to driver (alias for existing function for backward compatibility)
const assignVehicleToDriver = assignVehicle;

// Export all functions
const driverService = {
  getDrivers,
  getDriverById,
  createDriverAccount,
  createDriverDetails,
  updateDriver,
  deleteDriver,
  updateDriverStatus,
  verifyDriver,
  assignVehicle,
  unassignVehicle,
  createVehicle,
  assignVehicleToDriver,
  getDriverStats,
  getDriversWithoutVehicles,
};

export default driverService;