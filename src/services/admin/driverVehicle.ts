// driverVehicleService.ts

import { API_URL } from "../config/api";

export interface AssignVehicleData {
  driverId: string;
  vehicleId: string;
}

export interface UnassignVehicleData {
  driverId: string;
}

export interface SingleDriverResponse {
  success: boolean;
  message: string;
  driver?: any;
}

export interface DriverVehicleResponse {
  success: boolean;
  message: string;
  assignedDriver?: any;
  availableVehicles?: any[];
}

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Get drivers available for vehicle assignment
export const getDriversForAssignment = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/admin/drivers/available`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch drivers');
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching drivers:', error);
    throw new Error(error.message || 'Failed to fetch drivers');
  }
};

// Get available vehicles for assignment
export const getAvailableVehicles = async (): Promise<DriverVehicleResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/vehicles/available`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch available vehicles');
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching available vehicles:', error);
    throw new Error(error.message || 'Failed to fetch available vehicles');
  }
};

// Assign vehicle to driver
export const assignVehicleToDriver = async (assignData: AssignVehicleData): Promise<SingleDriverResponse> => {
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
export const unassignVehicleFromDriver = async (driverId: string): Promise<SingleDriverResponse> => {
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

// Get driver's current vehicle assignment
export const getDriverVehicle = async (driverId: string): Promise<DriverVehicleResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/drivers/${driverId}/vehicle`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get driver vehicle');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error getting driver vehicle:', error);
    throw new Error(error.message || 'Failed to get driver vehicle');
  }
};

const driverVehicleService = {
    getDriversForAssignment,
    getAvailableVehicles,
    assignVehicleToDriver,
    unassignVehicleFromDriver,
    getDriverVehicle,
  };
  
export default driverVehicleService;
  