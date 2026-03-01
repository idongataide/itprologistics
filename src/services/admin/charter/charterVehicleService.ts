// src/services/charterVehicleService.ts

import { API_URL } from "@/services/config/api";

export interface AssignCharterVehicleData {
  driverId: string;
  vehicleId: string;
}

export interface UnassignCharterVehicleData {
  driverId: string;
}

export interface SingleCharterDriverResponse {
  success: boolean;
  message: string;
  driver?: any;
  userId?: any;
}

export interface CharterVehicleResponse {
  success: boolean;
  message: string;
  assignedDriver?: any;
  availableVehicles?: any[];
  vehicle?: any;
}

export interface CreateCharterVehicleData {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  vehicleType: string;
  capacity: number;
  thumbnail?: File;
  features?: string[];
  fuelType?: string;
}

export interface UpdateCharterVehicleData {
  make?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  color?: string;
  vehicleType?: string;
  capacity?: number;
  thumbnail?: File;
  status?: 'available' | 'assigned' | 'maintenance' | 'inactive';
  features?: string[];
  fuelType?: string;
}

// Get auth headers - FIXED VERSION
const getAuthHeaders = (includeMultipart: boolean = false): HeadersInit => {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
  };
  
  if (!includeMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

// Alternative FIX using type assertion (if you prefer)
// const getAuthHeaders = (includeMultipart: boolean = false) => {
//   const token = localStorage.getItem('token');
//   if (includeMultipart) {
//     return {
//       'Authorization': `Bearer ${token}`,
//     } as HeadersInit;
//   }
//   return {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${token}`,
//   } as HeadersInit;
// };

// Get charter drivers available for vehicle assignment
export const getCharterDriversForAssignment = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/drivers/available/without-vehicles`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch charter drivers');
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching charter drivers:', error);
    throw new Error(error.message || 'Failed to fetch charter drivers');
  }
};

// Get all charter vehicles
export const getCharterVehicles = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/vehicles`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch charter vehicles');
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching charter vehicles:', error);
    throw new Error(error.message || 'Failed to fetch charter vehicles');
  }
};

// Get available charter vehicles for assignment
export const getAvailableCharterVehicles = async (): Promise<CharterVehicleResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/vehicles/available`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch available charter vehicles');
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching available charter vehicles:', error);
    throw new Error(error.message || 'Failed to fetch available charter vehicles');
  }
};

// Get single charter vehicle by ID
export const getCharterVehicleById = async (vehicleId: string): Promise<CharterVehicleResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/vehicles/${vehicleId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch charter vehicle');
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching charter vehicle:', error);
    throw new Error(error.message || 'Failed to fetch charter vehicle');
  }
};

// Create new charter vehicle with thumbnail
export const createCharterVehicle = async (vehicleData: CreateCharterVehicleData): Promise<any> => {
  try {
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.entries(vehicleData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'features' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'thumbnail' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await fetch(`${API_URL}/admin/charter/vehicles`, {
      method: 'POST',
      headers: getAuthHeaders(true), // Now TypeScript knows this returns HeadersInit
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create charter vehicle');
    }

    return data;
  } catch (error: any) {
    console.error('Error creating charter vehicle:', error);
    throw new Error(error.message || 'Failed to create charter vehicle');
  }
};

// Update charter vehicle
export const updateCharterVehicle = async (vehicleId: string, vehicleData: UpdateCharterVehicleData): Promise<any> => {
  try {
    console.log('Updating vehicle with ID:', vehicleId);
    console.log('Vehicle data:', vehicleData);
    
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.entries(vehicleData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'features' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'thumbnail' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const url = `${API_URL}/admin/charter/vehicles/${vehicleId}`;
    console.log('Request URL:', url);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(true), // Now TypeScript knows this returns HeadersInit
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Update failed with status:', response.status);
      console.error('Response data:', data);
      throw new Error(data.message || 'Failed to update charter vehicle');
    }

    return data;
  } catch (error: any) {
    console.error('Error updating charter vehicle:', error);
    throw new Error(error.message || 'Failed to update charter vehicle');
  }
};

// Delete charter vehicle
export const deleteCharterVehicle = async (vehicleId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/vehicles/${vehicleId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete charter vehicle');
    }

    return data;
  } catch (error: any) {
    console.error('Error deleting charter vehicle:', error);
    throw new Error(error.message || 'Failed to delete charter vehicle');
  }
};

// Assign vehicle to charter driver
export const assignCharterVehicleToDriver = async (assignData: AssignCharterVehicleData): Promise<SingleCharterDriverResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/drivers/${assignData.driverId}/assign-vehicle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ vehicleId: assignData.vehicleId }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to assign charter vehicle');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error assigning charter vehicle:', error);
    throw new Error(error.message || 'Failed to assign charter vehicle');
  }
};

// Unassign vehicle from charter driver
export const unassignCharterVehicleFromDriver = async (driverId: string): Promise<SingleCharterDriverResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/drivers/${driverId}/unassign-vehicle`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to unassign charter vehicle');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error unassigning charter vehicle:', error);
    throw new Error(error.message || 'Failed to unassign charter vehicle');
  }
};

// Get charter vehicle statistics
export const getCharterVehicleStats = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/vehicles/stats/summary`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch charter vehicle statistics');
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching charter vehicle statistics:', error);
    throw new Error(error.message || 'Failed to fetch charter vehicle statistics');
  }
};

// Get charter driver's current vehicle assignment
export const getCharterDriverVehicle = async (driverId: string): Promise<CharterVehicleResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/charter/drivers/${driverId}/vehicle`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get charter driver vehicle');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error getting charter driver vehicle:', error);
    throw new Error(error.message || 'Failed to get charter driver vehicle');
  }
};

const charterVehicleService = {
  getCharterDriversForAssignment,
  getCharterVehicles,
  getAvailableCharterVehicles,
  getCharterVehicleById,
  createCharterVehicle,
  updateCharterVehicle,
  deleteCharterVehicle,
  assignCharterVehicleToDriver,
  unassignCharterVehicleFromDriver,
  getCharterVehicleStats,
  getCharterDriverVehicle,
};

export default charterVehicleService;